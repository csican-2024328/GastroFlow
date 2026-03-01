import { check, param } from 'express-validator';

export const validateCreateMesa = [
    check('numero')
        .not()
        .isEmpty()
        .withMessage('El número de mesa es obligatorio'),

    check('capacidad')
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser un número positivo')
];

export const validateMesaId = [
    param('id')
        .isMongoId()
        .withMessage('ID de mesa inválido')
];

export const validateUpdateMesa = [
    param('id')
        .isMongoId()
        .withMessage('ID de mesa inválido'),

    check('capacidad')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser un número positivo')
];