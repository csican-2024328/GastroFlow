import mongoose from 'mongoose';

const mesaSchema = mongoose.Schema(
    {
        restaurantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El ID del restaurante es requerido'],
            index: true,
        },
        numero: {
            type: Number,
            required: [true, 'El número de la mesa es requerido'],
        },
        capacidad: {
            type: Number,
            required: [true, 'La capacidad es requerida'],
        },
        ubicacion: {
            type: String,
            required: [true, 'La ubicación de la mesa es requerida'],
        },
        horariosDisponibilidad: {
            type: [String],
            default: [],
        },
        es_unible: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

mesaSchema.index({ isActive: 1 });
mesaSchema.index({ ubicacion: 1 });
mesaSchema.index({ restaurantID: 1, numero: 1 }, { unique: true });

export default mongoose.model('Mesa', mesaSchema);
