import { check, param, body } from 'express-validator';
import Event from '../src/Event/event.model.js';

/**
 * Validar que no existan eventos solapados para el mismo restaurante
 * @param {string} restaurantID - ID del restaurante
 * @param {Date} fechaInicio - Fecha de inicio del evento
 * @param {Date} fechaFin - Fecha de fin del evento
 * @param {string} [excludeEventId] - ID del evento a excluir (para updates)
 * @returns {Promise<boolean>}
 */
const validarNoHayEventosSolapados = async (restaurantID, fechaInicio, fechaFin, excludeEventId = null) => {
    try {
        const filtro = {
            restaurantID,
            isActive: true,
            estado: { $in: ['ACTIVA', 'INACTIVA'] }, // Excluir FINALIZADA
            $or: [
                { fechaInicio: { $lt: new Date(fechaFin) }, fechaFin: { $gt: new Date(fechaInicio) } }
            ]
        };

        if (excludeEventId) {
            filtro._id = { $ne: excludeEventId };
        }

        const eventosConflicto = await Event.findOne(filtro);
        return !eventosConflicto;
    } catch (error) {
        console.error('Error validando eventos solapados:', error);
        return false;
    }
};

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

    check('menusAplicables')
        .isArray({ min: 1 })
        .withMessage('Debe seleccionar al menos un menú'),

    check('menusAplicables.*')
        .isMongoId()
        .withMessage('Cada menú debe tener un ID válido'),

    check('condiciones')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las condiciones no pueden exceder 500 caracteres'),

    check('musica')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El tipo de música no puede exceder 100 caracteres'),

    check('tematica')
        .optional()
        .isLength({ max: 100 })
        .withMessage('La temática no puede exceder 100 caracteres'),

    check('staffAsignados')
        .isArray({ min: 1 })
        .withMessage('Debe asignar al menos un miembro del staff'),

    check('staffAsignados.*')
        .isString()
        .withMessage('Cada ID de staff debe ser texto válido')
        .notEmpty()
        .withMessage('Cada ID de staff es obligatorio'),

    check('cantidadMaximaUsos')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad de usos debe ser un número entero positivo'),

    body().custom(async (value, { req }) => {
        const { restaurantID, fechaInicio, fechaFin } = req.body;
        
        if (restaurantID && fechaInicio && fechaFin) {
            const noHaySolapamiento = await validarNoHayEventosSolapados(
                restaurantID,
                fechaInicio,
                fechaFin
            );
            
            if (!noHaySolapamiento) {
                throw new Error('Ya existe un evento activo en este restaurante con fechas que se superponen');
            }
        }
    })
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

    check('menusAplicables')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Debe seleccionar al menos un menú'),

    check('menusAplicables.*')
        .optional()
        .isMongoId()
        .withMessage('Cada menú debe tener un ID válido'),

    check('condiciones')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las condiciones no pueden exceder 500 caracteres'),

    check('musica')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El tipo de música no puede exceder 100 caracteres'),

    check('tematica')
        .optional()
        .isLength({ max: 100 })
        .withMessage('La temática no puede exceder 100 caracteres'),

    check('staffAsignados')
        .optional()
        .isArray({ min: 1 })
        .withMessage('Debe asignar al menos un miembro del staff'),

    check('staffAsignados.*')
        .optional()
        .isString()
        .withMessage('Cada ID de staff debe ser texto válido')
        .notEmpty()
        .withMessage('Cada ID de staff es obligatorio'),

    check('cantidadMaximaUsos')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad de usos debe ser un número entero positivo'),

    body().custom(async (value, { req }) => {
        const { id } = req.params;
        const { restaurantID, fechaInicio, fechaFin } = req.body;
        
        if (restaurantID && fechaInicio && fechaFin) {
            const noHaySolapamiento = await validarNoHayEventosSolapados(
                restaurantID,
                fechaInicio,
                fechaFin,
                id
            );
            
            if (!noHaySolapamiento) {
                throw new Error('Ya existe un evento activo en este restaurante con fechas que se superponen');
            }
        }
    })
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
