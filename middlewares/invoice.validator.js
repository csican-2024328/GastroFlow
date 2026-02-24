import { check, param, body } from 'express-validator';

export const validateCreateInvoice = [
    body()
        .custom((value, { req }) => {
            if (!req.body.orderID && !req.body.eventID) {
                throw new Error('Debe proporcionar un ID de orden o un ID de evento');
            }
            return true;
        }),

    check('orderID')
        .optional()
        .isMongoId()
        .withMessage('ID de orden inválido'),

    check('eventID')
        .optional()
        .isMongoId()
        .withMessage('ID de evento inválido'),

    check('restaurantID')
        .not()
        .isEmpty()
        .withMessage('El ID del restaurante es obligatorio')
        .isMongoId()
        .withMessage('ID de restaurante inválido'),

    check('subtotal')
        .not()
        .isEmpty()
        .withMessage('El subtotal es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El subtotal debe ser un número mayor o igual a 0'),

    check('propina')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La propina debe ser un número mayor o igual a 0'),

    check('cargosExtra')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Los cargos extra deben ser un número mayor o igual a 0'),

    check('metodoPago')
        .not()
        .isEmpty()
        .withMessage('El método de pago es obligatorio')
        .isIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO'])
        .withMessage('Método de pago no válido')
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
        .not()
        .isEmpty()
        .withMessage('El estado es obligatorio')
        .isIn(['PENDIENTE', 'PAGADA', 'CANCELADA'])
        .withMessage('Estado no válido')
];
