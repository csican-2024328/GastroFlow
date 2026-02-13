'use strict';

import mongoose from "mongoose";

const platosSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del plato es requerido'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres']
        },
        precio: {
            type: Number,
            required: [true, 'El precio es requerido'],
            min: [0, 'El precio debe ser mayor o igual a 0']
        },
        categoria: {
            type: String,
            required: [true, 'La categoría es requerida'],
            enum: {
                values: ['ENTRADA', 'FUERTE', 'POSTRE', 'BEBIDA'],
                message: 'Categoría no válida',
            },
        },
        ingredientes: {
            type: [String],
            required: [true, 'Los ingredientes son requeridos'],
            validate: {
                validator: function(v) {
                    return v.length > 0;
                },
                message: 'Debe haber al menos un ingrediente'
            }
        },
        foto: {
            type: String,
            default: null,
        },
        restaurantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El ID del restaurante es requerido']
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
)

platosSchema.index({ isActive: 1});
platosSchema.index({ categoria: 1});
platosSchema.index({ restaurantID: 1});
platosSchema.index({ isActive: 1, categoria: 1});

export default mongoose.model('Plato', platosSchema);
