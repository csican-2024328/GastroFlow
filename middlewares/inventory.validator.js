import { check, param } from 'express-validator';

export const validateCreateInventory = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('El nombre del ingrediente es obligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    check('stock')
        .not()
        .isEmpty()
        .withMessage('El stock es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El stock debe ser un número positivo'),

    check('unit')
        .not()
        .isEmpty()
        .withMessage('La unidad de medida es obligatoria')
        .isLength({ min: 1, max: 20 })
        .withMessage('La unidad debe tener máximo 20 caracteres')
];

export const validateInventoryId = [
    param('id')
        .isMongoId()
        .withMessage('ID de inventario inválido')
];

export const validateUpdateInventory = [
    param('id')
        .isMongoId()
        .withMessage('ID de inventario inválido'),

    check('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    check('stock')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El stock debe ser un número positivo'),

    check('unit')
        .optional()
        .isLength({ min: 1, max: 20 })
        .withMessage('La unidad debe tener máximo 20 caracteres')
];