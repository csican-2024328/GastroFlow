import { check, param, body } from 'express-validator';
import mongoose from 'mongoose';
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
        const rid = new mongoose.Types.ObjectId(restaurantID);
        const filtro = {
            restaurantID: rid,
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
        if (eventosConflicto) {
            console.warn('⚠️ [OVERLAP DETECTED]', {
                restaurantID,
                new: { fechaInicio, fechaFin },
                existing: {
                    _id: eventosConflicto._id,
                    fechaInicio: eventosConflicto.fechaInicio,
                    fechaFin: eventosConflicto.fechaFin
                }
            });
        }
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
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre del evento es obligatorio')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    body('descripcion')
        .trim()
        .notEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),

    body('tipo')
        .notEmpty()
        .withMessage('El tipo de evento es obligatorio')
        .isIn(['PROMOCION', 'DESCUENTO', 'COMBO', 'HAPPY_HOUR', 'EVENTO_ESPECIAL', 'OFERTA_TEMPORAL'])
        .withMessage('Tipo de evento no válido'),

    body('restaurantID')
        .notEmpty()
        .withMessage('El ID del restaurante es obligatorio')
        .isMongoId()
        .withMessage('ID de restaurante inválido')
        .bail(),

    body('descuentoTipo')
        .optional()
        .isIn(['PORCENTAJE', 'CANTIDAD_FIJA'])
        .withMessage('Tipo de descuento debe ser PORCENTAJE o CANTIDAD_FIJA'),

    body('descuentoValor')
        .notEmpty()
        .withMessage('El valor del descuento es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El descuento debe ser un número válido mayor o igual a 0'),

    body('fechaInicio')
        .not()
        .isEmpty()
        .withMessage('La fecha de inicio es obligatoria')
        .isISO8601()
        .withMessage('La fecha de inicio debe ser válida'),

    body('fechaFin')
        .not()
        .isEmpty()
        .withMessage('La fecha de fin es obligatoria')
        .isISO8601()
        .withMessage('La fecha de fin debe ser válida'),

    body('menusAplicables')
        .optional()
        .isArray()
        .withMessage('menusAplicables debe ser un array'),

    body('menusAplicables.*')
        .optional()
        .isMongoId()
        .withMessage('Cada menú debe tener un ID válido'),

    body('platosAplicables')
        .optional()
        .isArray()
        .withMessage('platosAplicables debe ser un array'),

    body('platosAplicables.*')
        .optional()
        .isMongoId()
        .withMessage('Cada plato debe tener un ID válido'),

    body('condiciones')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las condiciones no pueden exceder 500 caracteres'),

    body('musica')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El tipo de música no puede exceder 100 caracteres'),

    body('tematica')
        .optional()
        .isLength({ max: 100 })
        .withMessage('La temática no puede exceder 100 caracteres'),

    body('staffAsignados')
        .optional()
        .isArray()
        .withMessage('Staff asignados debe ser un array'),

    body('staffAsignados.*')
        .optional()
        .isString()
        .withMessage('Cada ID de staff debe ser texto válido')
        .notEmpty()
        .withMessage('Cada ID de staff es obligatorio'),

    body('cantidadMaximaUsos')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad de usos debe ser un número entero positivo'),

    body().custom(async (value, { req }) => {
        const { restaurantID, fechaInicio, fechaFin, menusAplicables, platosAplicables } = req.body;
        
        // Validar que hay al menos un menú o plato aplicable
        if ((!menusAplicables || (Array.isArray(menusAplicables) && menusAplicables.length === 0)) && 
            (!platosAplicables || (Array.isArray(platosAplicables) && platosAplicables.length === 0))) {
            throw new Error('Debes seleccionar al menos un plato o menú aplicable');
        }
        
        return true;
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
        .notEmpty()
        .withMessage('El valor del descuento es obligatorio')
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
        .isArray()
        .withMessage('menusAplicables debe ser un array'),

    check('menusAplicables.*')
        .optional()
        .isMongoId()
        .withMessage('Cada menú debe tener un ID válido'),

    check('platosAplicables')
        .optional()
        .isArray()
        .withMessage('platosAplicables debe ser un array'),

    check('platosAplicables.*')
        .optional()
        .isMongoId()
        .withMessage('Cada plato debe tener un ID válido'),

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
        .isArray()
        .withMessage('Staff asignados debe ser un array'),

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
        return true;
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
