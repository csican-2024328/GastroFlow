'use strict';

import mongoose from "mongoose";

const restaurantSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del restaurante es requerido'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres']
        },
        address: {
            type: String,
            required: [true, 'La dirección es requerida'],
            trim: true,
            maxLength: [200, 'La dirección no puede exceder 200 caracteres']
        },
        category: {
            type: String,
            required: [true, 'La categoría gastronómica es requerida'],
            enum: {
                values: ['COMIDA_RAPIDA', 'TRADICIONAL', 'ITALIANA', 'MEXICANA', 'ASIATICA', 'OTRA'],
                message: 'Categoría gastronómica no válida'
            }
        },
        schedule: {
            type: String,
            required: [true, 'El horario es requerido'],
            trim: true
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

restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ isActive: 1, category: 1 });

export default mongoose.model('Restaurant', restaurantSchema);