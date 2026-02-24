import mongoose from 'mongoose';

const scheduleItemSchema = new mongoose.Schema(
	{
		dayNumber: {
			// 0 = Sunday, 1 = Monday ... 6 = Saturday
			type: Number,
			min: 0,
			max: 6,
			required: true,
		},
		startTime: {
			type: String,
			required: true, // format HH:MM
		},
		endTime: {
			type: String,
			required: true, // format HH:MM
		},
	},
	{ _id: false }
);

const menuSchema = mongoose.Schema(
	{
		nombre: {
			type: String,
			required: [true, 'El nombre del menú es requerido'],
			trim: true,
			maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
		},
		descripcion: {
			type: String,
			trim: true,
			maxLength: [500, 'La descripción no puede exceder 500 caracteres'],
		},
		precio: {
			type: Number,
			required: [true, 'El precio es requerido'],
			min: [0, 'El precio debe ser mayor o igual a 0'],
		},
		tipo: {
			// Clasificador: entrada, plato fuerte, postre, bebida
			type: String,
			required: [true, 'El tipo de menú es requerido'],
			enum: {
				values: ['ENTRADA', 'FUERTE', 'POSTRE', 'BEBIDA'],
				message: 'Tipo de menú no válido',
			},
		},
		ingredientes: {
			type: [String],
			default: [],
		},
		foto: {
			type: String,
			default: null,
		},
		restaurantID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Restaurant',
			required: [true, 'El ID del restaurante es requerido'],
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		disponible: {
			type: Boolean,
			default: true,
		},
		// Programación / menús dinámicos: horario por día de la semana
		schedule: {
			type: [scheduleItemSchema],
			default: [],
		},
		// Rango de fechas en los que el menú está programado
		availableFrom: {
			type: Date,
			default: null,
		},
		availableTo: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

menuSchema.index({ isActive: 1 });
menuSchema.index({ tipo: 1 });
menuSchema.index({ restaurantID: 1 });
menuSchema.index({ isActive: 1, tipo: 1 });

export default mongoose.model('Menu', menuSchema);

