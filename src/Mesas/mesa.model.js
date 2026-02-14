import mongoose from 'mongoose';

const mesaSchema = mongoose.Schema(
    {
        numero: {
            type: Number,
            required: [true, 'El número de la mesa es requerido'],
            unique: true,
        },
        capacidad: {
            type: Number,
            required: [true, 'La capacidad es requerida'],
        },
        ubicacion: {
            type: String,
            required: [true, 'La ubicación de la mesa es requerida'],
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

export default mongoose.model('Mesa', mesaSchema);
