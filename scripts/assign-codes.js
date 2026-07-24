import 'dotenv/config';
import { connect, disconnect } from 'mongoose';
import { ProductModel } from '../src/models/product-model.js';

const run = async () => {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/backend';
    await connect(mongoUrl);
    console.log(`Conectado a MongoDB (${mongoUrl})`);

    // productos que todavia no tienen code
    const products = await ProductModel.find({
        $or: [{ code: { $exists: false } }, { code: null }],
    }).sort({ category: 1, createdAt: 1 });

    if (products.length === 0) {
        console.log('No hay productos pendientes: todos ya tienen código.');
        await disconnect();
        return;
    }

    let updated = 0;
    for (const product of products) {
        await product.save(); // el pre-save hook asigna el code automaticamente
        updated++;
        console.log(`  ${product.code}  ->  ${product.title}`);
    }

    console.log(`\nListo. ${updated} producto(s) recibieron su código (SKU).`);
    await disconnect();
};

run().catch((error) => {
    console.error('Error en la migración:', error.message);
    process.exit(1);
});
