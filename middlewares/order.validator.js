import { check, param, body } from 'express-validator';

/**
 * Validaciones para crear un nuevo pedido
 */
export const validateCreateOrder = [
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

    check('clienteNombre')
        .not()
        .isEmpty()
        .withMessage('El nombre del cliente es obligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre del cliente debe tener entre 2 y 100 caracteres')
        .trim(),

    check('clienteTelefono')
        .optional()
        .isLength({ max: 20 })
        .withMessage('El teléfono no puede exceder 20 caracteres')
        .trim(),

    check('items')
        .isArray({ min: 1 })
        .withMessage('Debe incluir al menos un item en el pedido'),

    check('items.*.plato')
        .not()
        .isEmpty()
        .withMessage('El ID del plato es obligatorio en cada item')
        .isMongoId()
        .withMessage('ID de plato inválido'),

    check('items.*.cantidad')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0'),

    check('items.*.notas')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Las notas del item no pueden exceder 200 caracteres')
        .trim(),

    check('impuesto')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El impuesto debe ser mayor o igual a 0'),

    check('descuento')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El descuento debe ser mayor o igual a 0'),

    check('notas')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
        .trim()
];

/**
 * Validaciones para actualizar un pedido
 */
export const validateUpdateOrder = [
    param('id')
        .isMongoId()
        .withMessage('ID de pedido inválido'),

    check('clienteNombre')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre del cliente debe tener entre 2 y 100 caracteres')
        .trim(),

    check('clienteTelefono')
        .optional()
        .isLength({ max: 20 })
        .withMessage('El teléfono no puede exceder 20 caracteres')
        .trim(),

    check('items')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Debe incluir al menos un item en el pedido'),

    check('items.*.plato')
        .optional()
        .isMongoId()
        .withMessage('ID de plato inválido'),

    check('items.*.cantidad')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0'),

    check('items.*.notas')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Las notas del item no pueden exceder 200 caracteres')
        .trim(),

    check('impuesto')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El impuesto debe ser mayor o igual a 0'),

    check('descuento')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El descuento debe ser mayor o igual a 0'),

    check('notas')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
        .trim()
];

/**
 * Validaciones para actualizar el estado de un pedido
 */
export const validateUpdateOrderStatus = [
    param('id')
        .isMongoId()
        .withMessage('ID de pedido inválido'),

    body('estado')
        .not()
        .isEmpty()
        .withMessage('El estado es obligatorio')
        .isIn(['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'SERVIDO', 'PAGADO', 'CANCELADO'])
        .withMessage('Estado no válido. Debe ser: PENDIENTE, EN_PREPARACION, LISTO, SERVIDO, PAGADO o CANCELADO')
];

/**
 * Validaciones para pagar un pedido
 */
export const validatePayOrder = [
    param('id')
        .isMongoId()
        .withMessage('ID de pedido inválido'),

    body('metodoPago')
        .not()
        .isEmpty()
        .withMessage('El método de pago es obligatorio')
        .isIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'])
        .withMessage('Método de pago no válido. Debe ser: EFECTIVO, TARJETA o TRANSFERENCIA')
];

/**
 * Validación para parámetros de ID
 */
export const validateOrderId = [
    param('id')
        .isMongoId()
        .withMessage('ID de pedido inválido')
];

/**
 * Validación para número de orden
 */
export const validateOrderNumber = [
    param('numeroOrden')
        .not()
        .isEmpty()
        .withMessage('El número de orden es obligatorio')
        .matches(/^ORD-\d{8}-\d{5}$/)
        .withMessage('Formato de número de orden inválido')
];

/**
 * Validaciones para cancelar un pedido
 */
export const validateCancelOrder = [
    param('id')
        .isMongoId()
        .withMessage('ID de pedido inválido'),

    body('motivo')
        .optional()
        .isLength({ max: 200 })
        .withMessage('El motivo no puede exceder 200 caracteres')
        .trim()
];
