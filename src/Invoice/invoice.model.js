import mongoose from 'mongoose';

const invoiceSchema = mongoose.Schema(
    {
        orderID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null
        },
        eventID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            default: null
        },
        restaurantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El ID del restaurante es requerido']
        },
        userID: {
            type: String, // Asumiendo que el ID de usuario viene de PostgreSQL (UUID o String)
            required: [true, 'El ID del usuario es requerido']
        },
        subtotal: {
            type: Number,
            required: [true, 'El subtotal es requerido'],
            min: [0, 'El subtotal no puede ser negativo']
        },
        propina: {
            type: Number,
            default: 0,
            min: [0, 'La propina no puede ser negativa']
        },
        cargosExtra: {
            type: Number,
            default: 0,
            min: [0, 'Los cargos extra no pueden ser negativos']
        },
        total: {
            type: Number,
            default: 0,
            min: [0, 'El total no puede ser negativo']
        },
        estado: {
            type: String,
            enum: {
                values: ['PENDIENTE', 'PAGADA', 'CANCELADA'],
                message: 'Estado de factura no válido'
            },
            default: 'PENDIENTE'
        },
        metodoPago: {
            type: String,
            enum: {
                values: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'],
                message: 'Método de pago no válido'
            },
            default: 'OTRO'
        },
        fechaEmision: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices para búsquedas rápidas
invoiceSchema.index({ restaurantID: 1, estado: 1 });
invoiceSchema.index({ userID: 1 });
invoiceSchema.index({ fechaEmision: -1 });

export default mongoose.model('Invoice', invoiceSchema);
