'use strict';

import mongoose from 'mongoose';

const couponSchema = mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código del cupón es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'El código debe tener al menos 3 caracteres'],
      maxlength: [20, 'El código no puede exceder 20 caracteres'],
      match: [/^[A-Z0-9-]+$/, 'El código solo puede contener letras, números y guiones'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    porcentajeDescuento: {
      type: Number,
      required: [true, 'El porcentaje de descuento es obligatorio'],
      min: [0, 'El porcentaje no puede ser menor a 0'],
      max: [100, 'El porcentaje no puede ser mayor a 100'],
    },
    montoFijo: {
      type: Number,
      min: [0, 'El monto fijo no puede ser menor a 0'],
      default: 0,
    },
    tipo: {
      type: String,
      enum: {
        values: ['PORCENTAJE', 'MONTO_FIJO'],
        message: 'El tipo debe ser PORCENTAJE o MONTO_FIJO',
      },
      default: 'PORCENTAJE',
    },
    fechaExpiracion: {
      type: Date,
      required: [true, 'La fecha de expiración es obligatoria'],
      validate: {
        validator: function(v) {
          return v > new Date();
        },
        message: 'La fecha de expiración debe ser en el futuro',
      },
    },
    fechaInicio: {
      type: Date,
      default: Date.now,
    },
    usosMaximos: {
      type: Number,
      min: [1, 'Los usos máximos deben ser al menos 1'],
      default: null, // null = ilimitado
    },
    usosActuales: {
      type: Number,
      default: 0,
    },
    montoMinimo: {
      type: Number,
      min: [0, 'El monto mínimo no puede ser menor a 0'],
      default: 0,
    },
    montoMaximoDescuento: {
      type: Number,
      min: [0, 'El monto máximo de descuento no puede ser menor a 0'],
      default: null, // null = ilimitado
    },
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null, // null = válido para todos los restaurantes
    },
    usuariosAplicados: [
      {
        usuarioID: String,
        fechaAplicacion: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

// Índices para búsquedas eficientes
couponSchema.index({ codigo: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ fechaExpiracion: 1 });
couponSchema.index({ restaurantID: 1 });
couponSchema.index({ isActive: 1, fechaExpiracion: 1 });

// Método para verificar si el cupón es válido
couponSchema.methods.esValido = function() {
  const ahora = new Date();
  
  // Verificar si está activo
  if (!this.isActive) {
    return { valido: false, razon: 'Cupón desactivado' };
  }
  
  // Verificar fecha de inicio
  if (this.fechaInicio > ahora) {
    return { valido: false, razon: 'Cupón aún no está disponible' };
  }
  
  // Verificar fecha de expiración
  if (this.fechaExpiracion < ahora) {
    return { valido: false, razon: 'Cupón expirado' };
  }
  
  // Verificar usos máximos
  if (this.usosMaximos && this.usosActuales >= this.usosMaximos) {
    return { valido: false, razon: 'Cupón agotado - se alcanzó el máximo de usos' };
  }
  
  return { valido: true };
};

// Método para calcular descuento
couponSchema.methods.calcularDescuento = function(montoTotal) {
  let descuento = 0;
  
  if (this.tipo === 'PORCENTAJE') {
    descuento = (montoTotal * this.porcentajeDescuento) / 100;
  } else if (this.tipo === 'MONTO_FIJO') {
    descuento = this.montoFijo;
  }
  
  // Aplicar límite máximo de descuento si existe
  if (this.montoMaximoDescuento) {
    descuento = Math.min(descuento, this.montoMaximoDescuento);
  }
  
  return descuento;
};

// Método para registrar uso del cupón
couponSchema.methods.registrarUso = async function(usuarioID) {
  // Incrementar usos actuales
  this.usosActuales += 1;
  
  // Agregar usuario a la lista de aplicados
  this.usuariosAplicados.push({
    usuarioID,
    fechaAplicacion: new Date(),
  });
  
  await this.save();
};

export default mongoose.model('Coupon', couponSchema);
