import { check, param } from 'express-validator';

/**
 * Validaciones para crear un nuevo evento
 */
export const validateCreateEvent = [
    check('nombre')
        .not()
        .isEmpty()
        .withMessage('El nombre del evento es obligatorio')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('descripcion')
        .not()
        .isEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),

    check('tipo')
        .not()
        .isEmpty()
        .withMessage('El tipo de evento es obligatorio')
        .isIn(['PROMOCION', 'DESCUENTO', 'COMBO', 'HAPPY_HOUR', 'EVENTO_ESPECIAL', 'OFERTA_TEMPORAL'])
        .withMessage('Tipo de evento no válido'),

    check('restaurantID')
        .not()
        .isEmpty()
        .withMessage('El ID del restaurante es obligatorio')
        .isMongoId()
        .withMessage('ID de restaurante inválido'),

    check('descuentoTipo')
        .optional()
        .isIn(['PORCENTAJE', 'CANTIDAD_FIJA'])
        .withMessage('Tipo de descuento debe ser PORCENTAJE o CANTIDAD_FIJA'),

    check('descuentoValor')
        .not()
        .isEmpty()
        .withMessage('El valor del descuento es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El descuento debe ser un número válido mayor o igual a 0'),

    check('fechaInicio')
        .not()
        .isEmpty()
        .withMessage('La fecha de inicio es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio debe ser válida'),

    check('fechaFin')
        .not()
        .isEmpty()
        .withMessage('La fecha de fin es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin debe ser válida'),

    check('platosAplicables')
        .isArray({ min: 1 })
        .withMessage('Debe seleccionar al menos un plato'),

    check('platosAplicables.*')
        .isMongoId()
        .withMessage('Cada plato debe tener un ID válido'),

    check('condiciones')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las condiciones no pueden exceder 500 caracteres'),

    check('compraMinima')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La compra mínima debe ser mayor o igual a 0'),

    check('cantidadMaximaUsos')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad de usos debe ser un número entero positivo')
];

/**
 * Validaciones para actualizar un evento
 */
export const validateUpdateEvent = [
    param('id')
        .isMongoId()
        .withMessage('ID de evento inválido'),

    check('nombre')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    check('descripcion')
        .optional()
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),

    check('tipo')
        .optional()
        .isIn(['PROMOCION', 'DESCUENTO', 'COMBO', 'HAPPY_HOUR', 'EVENTO_ESPECIAL', 'OFERTA_TEMPORAL'])
        .withMessage('Tipo de evento no válido'),

    check('descuentoTipo')
        .optional()
        .isIn(['PORCENTAJE', 'CANTIDAD_FIJA'])
        .withMessage('Tipo de descuento debe ser PORCENTAJE o CANTIDAD_FIJA'),

    check('descuentoValor')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El descuento debe ser un número válido mayor o igual a 0'),

    check('fechaInicio')
        .optional()
        .isISO8601()
        .withMessage('La fecha de inicio debe ser válida'),

    check('fechaFin')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe ser válida'),

    check('platosAplicables')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Debe seleccionar al menos un plato'),

    check('platosAplicables.*')
        .optional()
        .isMongoId()
        .withMessage('Cada plato debe tener un ID válido'),

    check('condiciones')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las condiciones no pueden exceder 500 caracteres'),

    check('compraMinima')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La compra mínima debe ser mayor o igual a 0'),

    check('cantidadMaximaUsos')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad de usos debe ser un número entero positivo')
];

/**
 * Validaciones para ID de evento
 */
export const validateEventId = [
    param('id')
        .isMongoId()
        .withMessage('ID de evento inválido')
];

/**
 * Validaciones para ID de restaurante
 */
export const validateRestaurantId = [
    param('restaurantID')
        .isMongoId()
        .withMessage('ID de restaurante inválido')
];
