import { Schema, model } from "mongoose";

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // no puede haber dos usuarios con el mismo email
        lowercase: true, // convierte a minúsculas
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido'] // validación de formato
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 120
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // mínimo 6 caracteres
    },
    cart: {
        type: Schema.Types.ObjectId, // referencia a un carrito
        ref: "Cart"
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // solo puede ser user o admin
        default: 'user'
    }
    }, {
    timestamps: true,
    versionKey: false
});

// método virtual para obtener el nombre completo
userSchema.virtual('fullName').get(function() {
    return `${this.first_name} ${this.last_name}`;
});

// no devolver la contraseña en las consultas json
userSchema.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.password;
        delete ret.id; // eliminamos el id duplicado si existe
        return ret;
    }
});

export const UserModel = model("User", userSchema);