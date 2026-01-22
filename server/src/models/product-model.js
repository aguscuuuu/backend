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
        type: [String],  // array de strings (URLs de imágenes)
        default: []
    }
}, {
  timestamps: true,  // agrega createdAt y updatedAt automáticamente
  versionKey: false  // elimina el campo __v
});

// agregar plugin de paginación
productSchema.plugin(mongoosePaginate);

// crea el modelo basado en el schema
export const ProductModel = model("Product", productSchema);