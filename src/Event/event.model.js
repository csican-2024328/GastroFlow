'use strict';

import mongoose from "mongoose";

/**
 * Schema para Eventos y Promociones Gastronómicas
 */
const eventSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del evento es requerido'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres']
        },
        descripcion: {
            type: String,
            required: [true, 'La descripción es requerida'],
            trim: true,
            maxLength: [500, 'La descripción no puede exceder 500 caracteres']
        },
        tipo: {
            type: String,
            required: [true, 'El tipo de evento es requerido'],
            enum: {
                values: ['PROMOCION', 'DESCUENTO', 'COMBO', 'HAPPY_HOUR', 'EVENTO_ESPECIAL', 'OFERTA_TEMPORAL'],
                message: 'Tipo de evento no válido. Use: PROMOCION, DESCUENTO, COMBO, HAPPY_HOUR, EVENTO_ESPECIAL, OFERTA_TEMPORAL'
            }
        },
        restaurantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El ID del restaurante es requerido'],
            index: true
        },
        descuentoTipo: {
            type: String,
            enum: {
                values: ['PORCENTAJE', 'CANTIDAD_FIJA'],
                message: 'Tipo de descuento debe ser PORCENTAJE o CANTIDAD_FIJA'
            },
            default: 'PORCENTAJE'
        },
        descuentoValor: {
            type: Number,
            required: [true, 'El valor del descuento es requerido'],
            min: [0, 'El descuento debe ser mayor o igual a 0'],
            validate: {
                validator: function(v) {
                    if (this.descuentoTipo === 'PORCENTAJE') {
                        return v >= 0 && v <= 100;
                    }
                    return v >= 0;
                },
                message: 'Para porcentaje, el valor debe estar entre 0 y 100. Para cantidad fija, debe ser positivo'
            }
        },
        fechaInicio: {
            type: Date,
            required: [true, 'La fecha de inicio es requerida']
        },
        fechaFin: {
            type: Date,
            required: [true, 'La fecha de fin es requerida'],
            validate: {
                validator: function(v) {
                    return v > this.fechaInicio;
                },
                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
            }
        },
        platosAplicables: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Plato',
            validate: {
                validator: function(v) {
                    return v.length > 0;
                },
                message: 'Debe seleccionar al menos un plato para la promoción'
            }
        },
        condiciones: {
            type: String,
            trim: true,
            maxLength: [500, 'Las condiciones no pueden exceder 500 caracteres'],
            default: 'Sin condiciones adicionales'
        },
        imagenPromo: {
            type: String,
            default: null
        },
        compraMinima: {
            type: Number,
            min: [0, 'La compra mínima debe ser mayor o igual a 0'],
            default: 0
        },
        cantidadMaximaUsos: {
            type: Number,
            min: [1, 'La cantidad de usos debe ser al menos 1'],
            default: null
        },
        usosActuales: {
            type: Number,
            default: 0,
            min: [0, 'Los usos actuales no pueden ser negativos']
        },
        estado: {
            type: String,
            enum: {
                values: ['ACTIVA', 'INACTIVA', 'FINALIZADA'],
                message: 'Estado no válido'
            },
            default: 'ACTIVA',
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        criadoPor: {
            type: String,
            required: [true, 'El ID del usuario que creó el evento es requerido']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices para mejorar el rendimiento
eventSchema.index({ restaurantID: 1, estado: 1 });
eventSchema.index({ restaurantID: 1, isActive: 1 });
eventSchema.index({ fechaInicio: 1, fechaFin: 1 });
eventSchema.index({ tipo: 1 });
eventSchema.index({ createdAt: -1 });

// Pre-save hook para validar fechas
eventSchema.pre('save', function() {
    const ahora = new Date();
    
    // Si la fecha de fin pasó, marcar como FINALIZADA
    if (this.fechaFin < ahora && this.estado !== 'FINALIZADA') {
        this.estado = 'FINALIZADA';
    }
    
    // Si fecha de inicio no ha llegado, marcar como INACTIVA
    if (this.fechaInicio > ahora && this.estado === 'ACTIVA') {
        this.estado = 'INACTIVA';
    }
});

// Método para verificar si la promoción está vigente
eventSchema.methods.esVigente = function() {
    const ahora = new Date();
    return this.fechaInicio <= ahora && ahora <= this.fechaFin && this.isActive;
};

// Método para verificar si puede usarse más
eventSchema.methods.puedeUsarse = function() {
    if (!this.esVigente()) return false;
    if (this.cantidadMaximaUsos && this.usosActuales >= this.cantidadMaximaUsos) return false;
    return true;
};

// Método para incrementar usos
eventSchema.methods.incrementarUsos = async function() {
    this.usosActuales += 1;
    if (this.cantidadMaximaUsos && this.usosActuales >= this.cantidadMaximaUsos) {
        this.estado = 'FINALIZADA';
    }
    return await this.save();
};

export default mongoose.model('Event', eventSchema);
