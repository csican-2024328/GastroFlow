import { check, param, body } from 'express-validator';

export const validateCreateReservation = [
    check('restaurantID')
        .not()
        .isEmpty()
        .withMessage('El ID del restaurante es obligatorio')
        .isMongoId()
        .withMessage('ID de restaurante inválido'),

    check('mesaID')
        .not()
        .isEmpty()
        .withMessage('El ID de la mesa es obligatorio')
        .isMongoId()
        .withMessage('ID de mesa inválido'),

    check('fechaReserva')
        .not()
        .isEmpty()
        .withMessage('La fecha de reserva es obligatoria')
        .isISO8601()
        .withMessage('La fecha de reserva debe ser una fecha válida en formato ISO 8601'),

    check('cantidadPersonas')
        .isInt({ min: 1 })
        .withMessage('La cantidad de personas debe ser un entero mayor o igual a 1'),

    check('notas')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
        .trim(),
];

export const validateUpdateReservation = [
    param('id')
        .isMongoId()
        .withMessage('ID de reservación inválido'),

    check('restaurantID')
        .optional()
        .isMongoId()
        .withMessage('ID de restaurante inválido'),

    check('mesaID')
        .optional()
        .isMongoId()
        .withMessage('ID de mesa inválido'),

    check('fechaReserva')
        .optional()
        .isISO8601()
        .withMessage('La fecha de reserva debe ser una fecha válida en formato ISO 8601'),

    check('cantidadPersonas')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad de personas debe ser un entero mayor o igual a 1'),

    check('estado')
        .optional()
        .isIn(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
        .withMessage('Estado de reservación no válido'),

    check('notas')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
        .trim(),
];

export const validateReservationId = [
    param('id')
        .isMongoId()
        .withMessage('ID de reservación inválido'),
];

export const validateDeleteReservation = [
    param('id')
        .isMongoId()
        .withMessage('ID de reservación inválido'),

    body('motivo')
        .optional()
        .isLength({ max: 200 })
        .withMessage('El motivo no puede exceder 200 caracteres')
        .trim(),
];
