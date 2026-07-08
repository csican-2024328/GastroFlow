import { check, param } from 'express-validator';

export const validateCreateRestaurant = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('address')
        .not()
        .isEmpty()
        .withMessage('La dirección es obligatoria')
        .isLength({ min: 5, max: 200 })
        .withMessage('La dirección debe tener entre 5 y 200 caracteres'),

    check('phone')
        .optional()
        .isLength({ min: 8, max: 15 })
        .withMessage('El teléfono debe tener entre 8 y 15 caracteres')
];

export const validateRestaurantId = [
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante inválido')
];

export const validateUpdateRestaurant = [
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante inválido'),

    check('name')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('address')
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage('La dirección debe tener entre 5 y 200 caracteres'),

    check('phone')
        .optional()
        .isLength({ min: 8, max: 15 })
        .withMessage('El teléfono debe tener entre 8 y 15 caracteres')
];

export const validateRestaurantStatus = [
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante inválido')
];
