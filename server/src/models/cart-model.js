import { Schema, model } from "mongoose";

const cartProductSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId, // referencia al id de un producto
        ref: "Product", // nombre del modelo al que hace referencia
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
}, { _id: false });  // no crear _id para cada producto en el carrito

const cartSchema = new Schema({
    products: {
        type: [cartProductSchema], // array de productos
        default: []
    }
    }, {
    timestamps: true, // agrega createdat y updatedat
    versionKey: false
});

// método para calcular el total del carrito
cartSchema.methods.calculateTotal = async function() {
    await this.populate('products.product');
    return this.products.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
};

export const CartModel = model("Cart", cartSchema);