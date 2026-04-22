'use strict';

import { check, param } from 'express-validator';

export const validateCreateCoupon = [
  check('codigo')
    .notEmpty()
    .withMessage('El código del cupón es requerido')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('El código debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('El código solo puede contener letras mayúsculas, números y guiones'),

  check('tipo')
    .notEmpty()
    .withMessage('El tipo de cupón es requerido')
    .isIn(['PORCENTAJE', 'MONTO_FIJO'])
    .withMessage('El tipo debe ser PORCENTAJE o MONTO_FIJO'),

  check('fechaExpiracion')
    .notEmpty()
    .withMessage('La fecha de expiración es requerida')
    .isISO8601()
    .withMessage('La fecha debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      if (fecha <= new Date()) {
        throw new Error('La fecha de expiración debe ser en el futuro');
      }
      return true;
    }),

  check('porcentajeDescuento')
    .if((value) => value !== undefined)
    .isNumeric()
    .withMessage('El porcentaje debe ser un número')
    .custom((value) => {
      if (value < 0 || value > 100) {
        throw new Error('El porcentaje debe estar entre 0 y 100');
      }
      return true;
    }),

  check('montoFijo')
    .if((value) => value !== undefined)
    .isNumeric()
    .withMessage('El monto debe ser un número')
    .custom((value) => {
      if (value < 0) {
        throw new Error('El monto no puede ser negativo');
      }
      return true;
    }),

  check('usosMaximos')
    .if((value) => value !== undefined)
    .isInt({ min: 1 })
    .withMessage('Los usos máximos deben ser al menos 1'),

  check('montoMinimo')
    .if((value) => value !== undefined)
    .isNumeric()
    .withMessage('El monto mínimo debe ser un número')
    .custom((value) => {
      if (value < 0) {
        throw new Error('El monto mínimo no puede ser negativo');
      }
      return true;
    }),

  check('montoMaximoDescuento')
    .if((value) => value !== undefined)
    .isNumeric()
    .withMessage('El monto máximo de descuento debe ser un número')
    .custom((value) => {
      if (value < 0) {
        throw new Error('El monto máximo de descuento no puede ser negativo');
      }
      return true;
    }),

  check('descripcion')
    .if((value) => value !== undefined)
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),

  check('restaurantID')
    .if((value) => value !== undefined)
    .isMongoId()
    .withMessage('El restaurantID debe ser un MongoDB ID válido'),
];

export const validateUpdateCoupon = [
  check('codigo')
    .if((value) => value !== undefined)
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('El código debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('El código solo puede contener letras mayúsculas, números y guiones'),

  check('tipo')
    .if((value) => value !== undefined)
    .isIn(['PORCENTAJE', 'MONTO_FIJO'])
    .withMessage('El tipo debe ser PORCENTAJE o MONTO_FIJO'),

  check('fechaExpiracion')
    .if((value) => value !== undefined)
    .isISO8601()
    .withMessage('La fecha debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      if (fecha <= new Date()) {
        throw new Error('La fecha de expiración debe ser en el futuro');
      }
      return true;
    }),

  check('porcentajeDescuento')
    .if((value) => value !== undefined)
    .isNumeric()
    .withMessage('El porcentaje debe ser un número')
    .custom((value) => {
      if (value < 0 || value > 100) {
        throw new Error('El porcentaje debe estar entre 0 y 100');
      }
      return true;
    }),

  check('descripcion')
    .if((value) => value !== undefined)
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
];

export const validateCouponId = [
  param('id')
    .isMongoId()
    .withMessage('El ID del cupón debe ser un MongoDB ID válido'),
];
