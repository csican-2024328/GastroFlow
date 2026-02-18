'use strict';

import mongoose from 'mongoose';

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del restaurante es obligatorio'],
      trim: true,
      maxLength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email debe ser válido'],
    },
    phone: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      trim: true,
    },
    openingHours: {
      type: String,
      required: [true, 'El horario de apertura es obligatorio'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ city: 1 });

export default mongoose.model('Restaurant', restaurantSchema);