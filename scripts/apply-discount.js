import 'dotenv/config';
import { connect, disconnect } from 'mongoose';
import { ProductModel } from '../src/models/product-model.js';

// porcentaje de descuento a aplicar a TODOS los productos
const DISCOUNT_PERCENT = 10;

const run = async () => {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/backend';
    await connect(mongoUrl);
    console.log(`Conectado a MongoDB (${mongoUrl})`);

    // solo los productos que todavia no tienen oldPrice (evita descontar dos veces)
    const products = await ProductModel.find({
        $or: [{ oldPrice: { $exists: false } }, { oldPrice: null }],
    });

    if (products.length === 0) {
        console.log('No hay productos pendientes: todos ya tienen el descuento aplicado.');
        await disconnect();
        return;
    }

    const factor = (100 - DISCOUNT_PERCENT) / 100;
    let updated = 0;

    for (const product of products) {
        const original = product.price;
        product.oldPrice = original;                    // guarda el precio anterior (referencia real)
        product.price = Math.round(original * factor);  // baja el precio real un 10%
        await product.save();
        updated++;
        console.log(`  ${product.title}: $${original} -> $${product.price}`);
    }

    console.log(`\nListo. ${updated} producto(s) actualizados con -${DISCOUNT_PERCENT}%.`);
    await disconnect();
};

run().catch((error) => {
    console.error('Error en la migracion:', error.message);
    process.exit(1);
});
