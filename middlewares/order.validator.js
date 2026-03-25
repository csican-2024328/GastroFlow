import { check, param, body } from 'express-validator';

/**
 * Validaciones para crear un nuevo pedido
 */
export const validateCreateOrder = [
    check('tipoPedido')
        .not()
        .isEmpty()
        .withMessage('El tipo de pedido es obligatorio')
        .isIn(['EN_MESA', 'A_DOMICILIO', 'PARA_LLEVAR'])
        .withMessage('Tipo de pedido no válido. Debe ser: EN_MESA, A_DOMICILIO o PARA_LLEVAR'),

    check('restaurantID')
        .not()
        .isEmpty()
        .withMessage('El ID del restaurante es obligatorio')
        .isMongoId()
        .withMessage('ID de restaurante inválido'),

    check('mesaID')
        .custom((value, { req }) => {
            if (req.body.tipoPedido === 'EN_MESA') {
                if (!value) {
                    throw new Error('El ID de la mesa es obligatorio para pedidos EN_MESA');
                }
                const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
                if (!mongoIdRegex.test(value)) {
                    throw new Error('ID de mesa inválido');
                }
            }
            return true;
        }),

    check('clienteDireccion')
        .custom((value, { req }) => {
            if (req.body.tipoPedido === 'A_DOMICILIO') {
                if (!value) {
                    throw new Error('La dirección del cliente es obligatoria para pedidos A_DOMICILIO');
                }
            }
            return true;
        }),

    check('horaProgramada')
        .custom((value, { req }) => {
            if (req.body.tipoPedido === 'PARA_LLEVAR') {
                if (!value) {
                    throw new Error('La hora programada es obligatoria para pedidos PARA_LLEVAR');
                }
            }
            return true;
        }),

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

    check('items.*.tipo')
        .not()
        .isEmpty()
        .withMessage('El tipo de item es obligatorio en cada item')
        .isIn(['PLATO', 'MENU'])
        .withMessage('El tipo de item debe ser PLATO o MENU'),

    check('items.*.plato')
        .custom((value, { req, path }) => {
            const index = Number(path.split('.')[1]);
            const item = req.body.items?.[index];

            if (item?.tipo === 'PLATO') {
                if (!value) {
                    throw new Error('El ID del plato es obligatorio cuando tipo es PLATO');
                }
                const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
                if (!mongoIdRegex.test(value)) {
                    throw new Error('ID de plato inválido');
                }
            }

            return true;
        }),

    check('items.*.menu')
        .custom((value, { req, path }) => {
            const index = Number(path.split('.')[1]);
            const item = req.body.items?.[index];

            if (item?.tipo === 'MENU') {
                if (!value) {
                    throw new Error('El ID del menú es obligatorio cuando tipo es MENU');
                }
                const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
                if (!mongoIdRegex.test(value)) {
                    throw new Error('ID de menú inválido');
                }
            }

            return true;
        }),

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

    check('couponCode')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('El código del cupón debe tener entre 1 y 50 caracteres')
        .trim()
        .toUpperCase(),

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

    check('items.*.tipo')
        .optional()
        .isIn(['PLATO', 'MENU'])
        .withMessage('El tipo de item debe ser PLATO o MENU'),

    check('items.*.plato')
        .custom((value, { req, path }) => {
            const index = Number(path.split('.')[1]);
            const item = req.body.items?.[index];

            if (item?.tipo === 'PLATO' && value) {
                const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
                if (!mongoIdRegex.test(value)) {
                    throw new Error('ID de plato inválido');
                }
            }

            return true;
        }),

    check('items.*.menu')
        .custom((value, { req, path }) => {
            const index = Number(path.split('.')[1]);
            const item = req.body.items?.[index];

            if (item?.tipo === 'MENU' && value) {
                const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
                if (!mongoIdRegex.test(value)) {
                    throw new Error('ID de menú inválido');
                }
            }

            return true;
        }),

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
        .isIn(['EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'])
        .withMessage('Estado no válido. Debe ser: EN_PREPARACION, LISTO, ENTREGADO o CANCELADO')
];

/**
 * Validaciones para pagar un pedido
 */
export const validatePayOrder = [
    param('id')
        .isMongoId()
        .withMessage('ID de pedido inválido'),

    body('metodoPago')
        .trim()
        .notEmpty()
        .withMessage('El método de pago es obligatorio')
        .isIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'])
        .withMessage('Método de pago no válido. Debe ser: EFECTIVO, TARJETA o TRANSFERENCIA'),

    body('propina')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La propina debe ser un monto fijo mayor o igual a 0'),

    body('cargosExtra')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Los cargos extra deben ser un monto fijo mayor o igual a 0')
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
