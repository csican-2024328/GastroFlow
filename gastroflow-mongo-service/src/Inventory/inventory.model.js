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
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El restaurante es requerido']
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

// Índice compuesto para evitar ingredientes duplicados por restaurante
inventorySchema.index({ restaurantId: 1, nombre: 1 }, { unique: true });

export default mongoose.model('Inventory', inventorySchema);