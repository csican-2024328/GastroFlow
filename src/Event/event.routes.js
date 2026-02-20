/**
 * @fileoverview Rutas de la API para Eventos y Promociones
 * Define todos los endpoints para gestionar eventos gastronómicos y promociones
 * Incluye autenticación, autorización y validaciones
 */

import { Router } from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    activateEvent,
    deactivateEvent,
    deleteEvent,
    useEvent,
    getEventosVigentes
} from './event.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreateEvent,
    validateUpdateEvent,
    validateEventId,
    validateRestaurantId
} from '../../middlewares/event.validator.js';

const router = Router();

/**
 * @route POST /events/create
 * @desc Crear un nuevo evento o promoción
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCreateEvent,
    validarCampos,
    createEvent
);

/**
 * @route GET /events/get
 * @desc Obtener todos los eventos con filtros opcionales
 * @access Requiere autenticación
 * @query {string} [restaurantID] - Filtrar por restaurante
 * @query {string} [tipo] - Filtrar por tipo
 * @query {string} [estado] - Filtrar por estado
 * @query {boolean} [vigentes] - Solo eventos vigentes
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=10] - Items por página
 */
router.get(
    '/get',
    autenticar,
    getEvents
);

/**
 * @route GET /events/restaurant/:restaurantID/vigentes
 * @desc Obtener eventos vigentes de un restaurante
 * @access Público
 */
router.get(
    '/restaurant/:restaurantID/vigentes',
    validateRestaurantId,
    validarCampos,
    getEventosVigentes
);

/**
 * @route POST /events/:id/usar
 * @desc Registrar el uso de una promoción
 * @access Requiere autenticación
 */
router.post(
    '/:id/usar',
    autenticar,
    validateEventId,
    validarCampos,
    useEvent
);

/**
 * @route PUT /events/:id/activate
 * @desc Activar un evento
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.put(
    '/:id/activate',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateEventId,
    validarCampos,
    activateEvent
);

/**
 * @route PUT /events/:id/deactivate
 * @desc Desactivar un evento
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.put(
    '/:id/deactivate',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateEventId,
    validarCampos,
    deactivateEvent
);

/**
 * @route DELETE /events/:id
 * @desc Eliminar un evento (soft delete)
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.delete(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateEventId,
    validarCampos,
    deleteEvent
);

/**
 * @route PUT /events/:id
 * @desc Actualizar un evento
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateEvent,
    validarCampos,
    updateEvent
);

/**
 * @route GET /events/:id
 * @desc Obtener un evento específico por ID
 * @access Requiere autenticación
 */
router.get(
    '/:id',
    autenticar,
    validateEventId,
    validarCampos,
    getEventById
);

export default router;
