import { check, param } from 'express-validator';

const normalizeIngredientes = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (!trimmed) return [];

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            // For multipart/form-data, a single selected value commonly arrives as plain string.
        }

        return [trimmed];
    }

    if (value == null) return [];
    return [value];
};

export const validateCreatePlato = [
    check('ingredientes').customSanitizer(normalizeIngredientes),

    check('nombre')
        .not()
        .isEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('precio')
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser mayor a 0'),

    check('restaurantId')
        .notEmpty()
        .withMessage('El restaurantId es obligatorio')
        .isMongoId()
        .withMessage('restaurantId debe ser un ID de MongoDB válido'),

    check('ingredientes')
        .notEmpty()
        .withMessage('Los ingredientes son obligatorios')
        .isArray({ min: 1 })
        .withMessage('Debe haber al menos un ingrediente'),

    check('ingredientes.*')
        .isMongoId()
        .withMessage('Cada ingrediente debe ser un ID de MongoDB válido'),

    check('categoria')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isIn(['ENTRADA', 'FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('La categoría debe ser: ENTRADA, FUERTE, POSTRE o BEBIDA')
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

    check('ingredientes').customSanitizer(normalizeIngredientes),

    check('restaurantId')
        .notEmpty()
        .withMessage('El restaurantId es obligatorio')
        .isMongoId()
        .withMessage('restaurantId debe ser un ID de MongoDB válido'),

    check('ingredientes')
        .notEmpty()
        .withMessage('Los ingredientes son obligatorios')
        .isArray({ min: 1 })
        .withMessage('Debe haber al menos un ingrediente'),

    check('ingredientes.*')
        .isMongoId()
        .withMessage('Cada ingrediente debe ser un ID de MongoDB válido'),

    check('nombre')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('precio')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser mayor a 0'),

    check('categoria')
        .optional()
        .isIn(['ENTRADA', 'FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('La categoría debe ser: ENTRADA, FUERTE, POSTRE o BEBIDA')
];