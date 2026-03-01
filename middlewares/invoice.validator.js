import { check, param } from 'express-validator';

export const validateCreateInvoice = [
    check('orderID')
        .optional()
        .isMongoId()
        .withMessage('ID de orden inválido'),

    check('eventID')
        .optional()
        .isMongoId()
        .withMessage('ID de evento inválido'),

    check('restaurantID')
        .optional()
        .isMongoId()
        .withMessage('ID de restaurante inválido'),

    check('subtotal')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El subtotal debe ser un número mayor o igual a 0')
];

export const validateInvoiceId = [
    param('id')
        .isMongoId()
        .withMessage('ID de factura inválido')
];

export const validateUpdateInvoiceStatus = [
    param('id')
        .isMongoId()
        .withMessage('ID de factura inválido'),
    
    check('estado')
        .trim()
        .notEmpty()
        .withMessage('El estado es obligatorio')
        .isIn(['PENDIENTE', 'PAGADA', 'CANCELADA'])
        .withMessage('Estado no válido')
];
