'use strict';

import mongoose from "mongoose";

/**
 * Schema para los items individuales de un pedido
 */
const orderItemSchema = mongoose.Schema({
    plato: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plato',
        required: [true, 'El plato es requerido']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del plato es requerido'],
        trim: true
    },
    cantidad: {
        type: Number,
        required: [true, 'La cantidad es requerida'],
        min: [1, 'La cantidad debe ser al menos 1']
    },
    precioUnitario: {
        type: Number,
        required: [true, 'El precio unitario es requerido'],
        min: [0, 'El precio unitario debe ser mayor o igual a 0']
    },
    subtotal: {
        type: Number,
        required: [true, 'El subtotal es requerido'],
        min: [0, 'El subtotal debe ser mayor o igual a 0']
    },
    notas: {
        type: String,
        trim: true,
        maxLength: [200, 'Las notas no pueden exceder 200 caracteres']
    }
}, { _id: false });

/**
 * Schema principal de Pedidos
 */
const orderSchema = mongoose.Schema(
    {
        numeroOrden: {
            type: String,
            required: [true, 'El número de orden es requerido'],
            unique: true,
            trim: true
        },
        restaurantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El ID del restaurante es requerido'],
            index: true
        },
        mesaID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mesa',
            required: [true, 'El ID de la mesa es requerido'],
            index: true
        },
        clienteNombre: {
            type: String,
            required: [true, 'El nombre del cliente es requerido'],
            trim: true,
            maxLength: [100, 'El nombre del cliente no puede exceder 100 caracteres']
        },
        clienteTelefono: {
            type: String,
            trim: true,
            maxLength: [20, 'El teléfono no puede exceder 20 caracteres']
        },
        items: {
            type: [orderItemSchema],
            required: [true, 'Los items del pedido son requeridos'],
            validate: {
                validator: function(v) {
                    return v.length > 0;
                },
                message: 'Debe haber al menos un item en el pedido'
            }
        },
        subtotal: {
            type: Number,
            default: 0,
            min: [0, 'El subtotal debe ser mayor o igual a 0']
        },
        impuesto: {
            type: Number,
            default: 0,
            min: [0, 'El impuesto debe ser mayor o igual a 0']
        },
        descuento: {
            type: Number,
            default: 0,
            min: [0, 'El descuento debe ser mayor o igual a 0']
        },
        couponCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: null,
        },
        couponID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
            default: null,
        },
        descuentoPorCoupon: {
            type: Number,
            default: 0,
            min: [0, 'El descuento del cupón debe ser mayor o igual a 0']
        },
        total: {
            type: Number,
            default: 0,
            min: [0, 'El total debe ser mayor o igual a 0']
        },
        estado: {
            type: String,
            required: [true, 'El estado es requerido'],
            enum: {
                values: ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'SERVIDO', 'PAGADO', 'CANCELADO'],
                message: 'Estado no válido'
            },
            default: 'PENDIENTE',
            index: true
        },
        metodoPago: {
            type: String,
            enum: {
                values: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'PENDIENTE'],
                message: 'Método de pago no válido'
            },
            default: 'PENDIENTE'
        },
        notas: {
            type: String,
            trim: true,
            maxLength: [500, 'Las notas no pueden exceder 500 caracteres']
        },
        horaEntrega: {
            type: Date
        },
        horaPago: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Índices compuestos para mejorar el rendimiento de las consultas
orderSchema.index({ restaurantID: 1, estado: 1 });
orderSchema.index({ restaurantID: 1, createdAt: -1 });
orderSchema.index({ mesaID: 1, estado: 1 });
orderSchema.index({ numeroOrden: 1 });

// Método para calcular el total antes de guardar
orderSchema.pre('save', function() {
    // Calcular subtotal si hay items
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((acc, item) => {
            item.subtotal = item.cantidad * item.precioUnitario;
            return acc + item.subtotal;
        }, 0);
    }
    
    // Calcular total
    this.total = this.subtotal + this.impuesto - this.descuento;
});

export default mongoose.model('Order', orderSchema);
