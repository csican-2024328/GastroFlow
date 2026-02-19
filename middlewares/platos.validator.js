import { check, param } from 'express-validator';

export const validateCreatePlato = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('price')
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser mayor a 0')
];

export const validatePlatoId = [
    param('id')
        .isMongoId()
        .withMessage('ID de plato inválido')
];

export const validateUpdatePlato = [
    param('id')
        .isMongoId()
        .withMessage('ID de plato inválido'),

    check('name')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('price')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser mayor a 0')
];