/**
 * @fileoverview Rutas para la gestión de platos
 * Define todos los endpoints relacionados con crear, actualizar, obtener y cambiar estado de platos
 */

import { Router } from 'express';
import { changePlayStatus, createPlato, getPlatoById, getPlatos, updatePlato } from './platos-controller.js';
import { uploadPlayImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreatePlato, validatePlayStatusChange, validateGetPlatoById, validateUpdatePlayRequest } from '../../middlewares/platos-validators.js';

/**
 * Instancia del router de Express para gestionar rutas de platos
 * @type {Router}
 */
const router = Router();

/**
 * POST /create
 * Crea un nuevo plato
 * @middleware uploadPlayImage.single('image') - Sube una imagen única del plato
 * @middleware cleanUploaderFileOnFinish - Limpia la imagen si ocurre un error
 * @middleware validateCreatePlato - Valida los datos del plato (nombre, descripción, precio, etc.)
 * @body {Object} Plato con los datos: nombre, descripción, precio, ingredientes, imagen
 * @returns {Object} Plato creado con ID y metadata
 */
router.post(
    '/create',
    uploadPlayImage.single('image'),
    cleanUploaderFileOnFinish,
    validateCreatePlato,
    createPlato
)

/**
 * GET /get
 * Obtiene todos los platos disponibles
 * @returns {Array} Lista de todos los platos con sus datos
 */
router.get(
    '/get',
    getPlatos
)

/**
 * GET /menu/:restaurantID
 * Obtiene la carta (menú) de un restaurante específico - Acceso público
 * @param {string} restaurantID - Identificador único del restaurante
 * @returns {Array} Lista de todos los platos activos del restaurante
 */
router.get('/menu/:restaurantID', getMenuByRestaurant)

/**
 * GET /:id
 * Obtiene un plato específico por su ID
 * @param {string} id - Identificador único del plato
 * @middleware validateGetPlatoById - Valida que el ID sea válido
 * @returns {Object} Datos detallados del plato solicitado
 */
router.get('/:id', validateGetPlatoById, getPlatoById);

/**
 * PUT /:id
 * Actualiza los datos de un plato existente
 * @param {string} id - Identificador único del plato
 * @middleware uploadPlayImage.single('image') - Sube una nueva imagen del plato (opcional)
 * @middleware cleanUploaderFileOnFinish - Limpia la imagen si ocurre un error
 * @middleware validateUpdatePlayRequest - Valida los datos a actualizar
 * @body {Object} Datos a actualizar del plato
 * @returns {Object} Plato actualizado con los nuevos datos
 */
// Rutas PUT - Requieren autenticación
router.put(
    '/:id',
    uploadPlayImage.single('image'),
    cleanUploaderFileOnFinish,
    validateUpdatePlayRequest,
    updatePlato
);

/**
 * PUT /:id/activate
 * Activa un plato (cambia su estado a activo)
 * @param {string} id - Identificador único del plato
 * @middleware validatePlayStatusChange - Valida que el ID sea válido
 * @returns {Object} Plato con estado actualizado a activo
 */
router.put('/:id/activate', validatePlayStatusChange, changePlayStatus);

/**
 * PUT /:id/deactivate
 * Desactiva un plato (cambia su estado a inactivo)
 * @param {string} id - Identificador único del plato
 * @middleware validatePlayStatusChange - Valida que el ID sea válido
 * @returns {Object} Plato con estado actualizado a inactivo
 */
router.put('/:id/deactivate', validatePlayStatusChange, changePlayStatus);

/**
 * Exporta el router configurado con todas las rutas
 * @exports router
 */
export default router;
