import mongoose from 'mongoose';

const reservationSchema = mongoose.Schema(
    {
        restaurantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El ID del restaurante es requerido'],
            index: true,
        },
        mesaID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mesa',
            required: [true, 'El ID de la mesa es requerido'],
            index: true,
        },
        clienteId: {
            type: String,
            required: [true, 'El ID del cliente es requerido'],
            trim: true,
            index: true,
        },
        clienteNombre: {
            type: String,
            required: [true, 'El nombre del cliente es requerido'],
            trim: true,
            maxLength: [120, 'El nombre del cliente no puede exceder 120 caracteres'],
        },
        clienteTelefono: {
            type: String,
            trim: true,
            maxLength: [20, 'El teléfono del cliente no puede exceder 20 caracteres'],
        },
        fechaReserva: {
            type: Date,
            required: [true, 'La fecha de reserva es requerida'],
            index: true,
        },
        horaInicio: {
            type: String,
            required: [true, 'La hora de inicio es requerida'],
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de hora debe ser HH:mm'],
        },
        horaFin: {
            type: String,
            required: [true, 'La hora de fin es requerida'],
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El formato de hora debe ser HH:mm'],
        },
        cantidadPersonas: {
            type: Number,
            required: [true, 'La cantidad de personas es requerida'],
            min: [1, 'La cantidad de personas debe ser al menos 1'],
        },
        estado: {
            type: String,
            required: [true, 'El estado es requerido'],
            enum: {
                values: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'],
                message: 'Estado de reservación no válido',
            },
            default: 'PENDIENTE',
            index: true,
        },
        notas: {
            type: String,
            trim: true,
            maxLength: [500, 'Las notas no pueden exceder 500 caracteres'],
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

reservationSchema.index({ restaurantID: 1, fechaReserva: 1, estado: 1 });
reservationSchema.index({ mesaID: 1, fechaReserva: 1, estado: 1 });
reservationSchema.index({ clienteId: 1, createdAt: -1 });

export default mongoose.model('Reservation', reservationSchema);
