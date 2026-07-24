import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// define la estructura de un producto
const productSchema = new Schema({
    title: {
        type: String,
        required: true,  // campo obligatorio
        trim: true       // elimina espacios al inicio/final
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0           // el precio no puede ser negativo
    },
    oldPrice: {
        type: Number,
        min: 0           // precio anterior (referencia para mostrar el descuento). opcional
    },
    code: {
        type: String,    // SKU: codigo interno unico y legible (ej. AUD001)
        unique: true,
        sparse: true,    // permite docs sin code sin romper el indice unico
        trim: true,
        uppercase: true
    },
    status: {
        type: Boolean,
        default: true    // por defecto los productos están activos
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    thumbnails: {
        type: [String],  // array de strings (urls de imágenes)
        default: []
    }
}, {
  timestamps: true,  // agrega createdat y updatedat automáticamente
  versionKey: false  // elimina el campo __v
});

// genera un prefijo de 3 letras a partir de la categoría (sin acentos)
const categoryPrefix = (category = '') =>
    category
        .normalize('NFD')            // descompone acentos (é -> e + tilde)
        .replace(/[^a-zA-Z]/g, '')   // deja solo letras A-Z (saca la tilde suelta y símbolos)
        .toUpperCase()
        .slice(0, 3)
        .padEnd(3, 'X');

// asigna un código (SKU) único automáticamente si el producto no tiene uno
productSchema.pre('save', async function () {
    if (this.code) return;
    const prefix = categoryPrefix(this.category);
    const count = await this.constructor.countDocuments({ code: new RegExp('^' + prefix) });
    this.code = `${prefix}${String(count + 1).padStart(3, '0')}`;
});

// agregar plugin de paginación
productSchema.plugin(mongoosePaginate);

// crea el modelo basado en el schema
export const ProductModel = model("Product", productSchema);