import { Schema, model } from "mongoose";

const productSchema = new Schema({
    title:{
        type: String,
        required: true, 
        trim: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true,
        min: 0 
    },
    status:{
        type: Boolean,
        default: true // activos por defecto
    },
    stock:{
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    category:{
        type: String,
        required: true
    },
    thumbnails:{
        type: [String],  // array de strings (urls de imágenes)
    },
},{
    timestamps: true, // agrega createdat y updatedat automáticamente
    versionKey: false // elimina el campo __v
})

export const ProductModel = model("Product", productSchema);