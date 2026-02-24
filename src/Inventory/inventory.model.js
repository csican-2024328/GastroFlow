import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        stock: {
            type: Number,
            required: true,
            min: 0
        },
        unidadMedida: {
            type: String,
            required: true,
            enum: ['kg', 'g', 'l', 'ml', 'unidad', 'paquete']
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Inventory', inventorySchema);