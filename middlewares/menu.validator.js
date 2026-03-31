import { body, param } from 'express-validator';

const ALLOWED_TYPES = ['ENTRADA', 'FUERTE', 'POSTRE', 'BEBIDA'];

export const validateCreateMenu = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser >= 0'),
  body('tipo').optional().isIn(ALLOWED_TYPES).withMessage('Tipo inválido'),
  body('restaurantId')
    .notEmpty()
    .withMessage('El ID del restaurante es obligatorio')
    .isMongoId()
    .withMessage('restaurantId debe ser un ID de MongoDB válido'),
  body('ingredientes')
    .optional()
    .isArray()
    .withMessage('Los ingredientes deben ser un arreglo'),
  body('ingredientes.*')
    .optional()
    .isMongoId()
    .withMessage('Cada ingrediente debe ser un ID de MongoDB válido'),
  body('platos')
    .optional()
    .isArray()
    .withMessage('Los platos deben ser un arreglo'),
  body('platos.*')
    .optional()
    .isMongoId()
    .withMessage('Cada plato debe ser un ID de MongoDB válido'),
  // schedule: array of { dayNumber, startTime, endTime }
  body('schedule').optional().isArray().withMessage('Schedule debe ser un arreglo'),
  body('schedule.*.dayNumber').optional().isInt({ min: 0, max: 6 }).withMessage('dayNumber debe estar entre 0 y 6'),
  body('schedule.*.startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('startTime debe tener formato HH:MM'),
  body('schedule.*.endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('endTime debe tener formato HH:MM'),
  body('availableFrom').optional().isISO8601().toDate().withMessage('availableFrom debe ser una fecha válida'),
  body('availableTo').optional().isISO8601().toDate().withMessage('availableTo debe ser una fecha válida'),
];

export const validateMenuId = [
  param('id').isMongoId().withMessage('ID de menú inválido'),
];

export const validateUpdateMenu = [
  param('id').isMongoId().withMessage('ID de menú inválido'),
  body('nombre').optional().trim().isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser >= 0'),
  body('tipo').optional().isIn(ALLOWED_TYPES).withMessage('Tipo inválido'),
  body('restaurantId')
    .optional()
    .isMongoId()
    .withMessage('restaurantId debe ser un ID de MongoDB válido'),
  body('ingredientes')
    .optional()
    .isArray()
    .withMessage('Los ingredientes deben ser un arreglo'),
  body('ingredientes.*')
    .optional()
    .isMongoId()
    .withMessage('Cada ingrediente debe ser un ID de MongoDB válido'),
  body('platos')
    .optional()
    .isArray()
    .withMessage('Los platos deben ser un arreglo'),
  body('platos.*')
    .optional()
    .isMongoId()
    .withMessage('Cada plato debe ser un ID de MongoDB válido'),
  body('schedule').optional().isArray().withMessage('Schedule debe ser un arreglo'),
  body('schedule.*.dayNumber').optional().isInt({ min: 0, max: 6 }).withMessage('dayNumber debe estar entre 0 y 6'),
  body('schedule.*.startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('startTime debe tener formato HH:MM'),
  body('schedule.*.endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('endTime debe tener formato HH:MM'),
  body('availableFrom').optional().isISO8601().toDate().withMessage('availableFrom debe ser una fecha válida'),
  body('availableTo').optional().isISO8601().toDate().withMessage('availableTo debe ser una fecha válida'),
];
