/**
 * @fileoverview Controlador de Eventos y Promociones Gastronómicas
 * Maneja toda la lógica de negocio para crear, obtener, actualizar y eliminar eventos/promociones
 * Incluye validaciones, manejo de errores y respuestas HTTP estandarizadas
 */

import Event from './event.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import Plato from '../Platos/platos-model.js';

/**
 * Crear un nuevo evento o promoción
 * Endpoint: POST /events/create
 * Acceso: Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.body.nombre - Nombre del evento
 * @param {string} req.body.descripcion - Descripción del evento
 * @param {string} req.body.tipo - Tipo: PROMOCION, DESCUENTO, COMBO, HAPPY_HOUR, EVENTO_ESPECIAL, OFERTA_TEMPORAL
 * @param {string} req.body.restaurantID - ID del restaurante
 * @param {string} req.body.descuentoTipo - PORCENTAJE o CANTIDAD_FIJA
 * @param {number} req.body.descuentoValor - Valor del descuento
 * @param {Date} req.body.fechaInicio - Fecha y hora de inicio
 * @param {Date} req.body.fechaFin - Fecha y hora de fin
 * @param {Array} req.body.platosAplicables - IDs de platos a los que aplica
 * @param {string} [req.body.condiciones] - Condiciones del evento
 * @param {number} [req.body.compraMinima] - Compra mínima requerida
 * @param {number} [req.body.cantidadMaximaUsos] - Máximos usos de la promoción
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con evento creado
 * 
 * @example
 * POST /events/create
 * Body: {
 *   "nombre": "Descuento de Fin de Semana",
 *   "descripcion": "20% de descuento en todas las bebidas",
 *   "tipo": "DESCUENTO",
 *   "restaurantID": "507f1f77bcf86cd799439011",
 *   "descuentoTipo": "PORCENTAJE",
 *   "descuentoValor": 20,
 *   "fechaInicio": "2026-02-21T00:00:00Z",
 *   "fechaFin": "2026-02-22T23:59:59Z",
 *   "platosAplicables": ["507f1f77bcf86cd799439013"],
 *   "condiciones": "solo viernes y sábado"
 * }
 */
export const createEvent = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            tipo,
            restaurantID,
            descuentoTipo = 'PORCENTAJE',
            descuentoValor,
            fechaInicio,
            fechaFin,
            platosAplicables,
            condiciones,
            compraMinima = 0,
            cantidadMaximaUsos
        } = req.body;

        // Validar que el restaurante existe
        const restaurante = await Restaurant.findById(restaurantID);
        if (!restaurante) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        // Validar que los platos existen
        if (platosAplicables && platosAplicables.length > 0) {
            const platos = await Plato.find({ _id: { $in: platosAplicables } });
            if (platos.length !== platosAplicables.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Uno o más platos no fueron encontrados'
                });
            }
        }

        const nuevoEvento = new Event({
            nombre,
            descripcion,
            tipo,
            restaurantID,
            descuentoTipo,
            descuentoValor,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            platosAplicables,
            condiciones,
            compraMinima,
            cantidadMaximaUsos,
            criadoPor: req.usuario.sub
        });

        await nuevoEvento.save();

        // Poblar referencias para la respuesta
        await nuevoEvento.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'platosAplicables', select: 'nombre precio' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            data: nuevoEvento
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear evento',
            error: error.message
        });
    }
};

/**
 * Obtener todos los eventos con filtros y paginación
 * Endpoint: GET /events/get
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} [req.query.restaurantID] - Filtrar por restaurante
 * @param {string} [req.query.tipo] - Filtrar por tipo de evento
 * @param {string} [req.query.estado] - Filtrar por estado (ACTIVA, INACTIVA, FINALIZADA)
 * @param {boolean} [req.query.vigentes] - Si es true, solo eventos vigentes
 * @param {number} [req.query.page=1] - Número de página
 * @param {number} [req.query.limit=10] - Items por página
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con lista de eventos y paginación
 */
export const getEvents = async (req, res) => {
    try {
        const { restaurantID, tipo, estado, vigentes = false, page = 1, limit = 10 } = req.query;

        let filtro = { isActive: true };

        if (restaurantID) {
            filtro.restaurantID = restaurantID;
        }

        if (tipo) {
            filtro.tipo = tipo;
        }

        if (estado) {
            filtro.estado = estado;
        }

        if (vigentes === 'true') {
            const ahora = new Date();
            filtro.fechaInicio = { $lte: ahora };
            filtro.fechaFin = { $gte: ahora };
            filtro.estado = 'ACTIVA';
        }

        const eventos = await Event.find(filtro)
            .populate('restaurantID', 'nombre')
            .populate('platosAplicables', 'nombre precio')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Event.countDocuments(filtro);

        res.status(200).json({
            success: true,
            message: 'Eventos obtenidos exitosamente',
            data: eventos,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos',
            error: error.message
        });
    }
};

/**
 * Obtener un evento específico por ID
 * Endpoint: GET /events/:id
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del evento
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con detalles del evento
 */
export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const evento = await Event.findById(id)
            .populate('restaurantID')
            .populate('platosAplicables');

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: evento
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener evento',
            error: error.message
        });
    }
};

/**
 * Actualizar un evento
 * Endpoint: PUT /events/:id
 * Acceso: Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del evento
 * @param {Object} req.body - Campos a actualizar
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con evento actualizado
 */
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizaciones = req.body;

        // No permitir cambiar restaurante o creador
        delete actualizaciones.restaurantID;
        delete actualizaciones.criadoPor;

        const evento = await Event.findByIdAndUpdate(
            id,
            actualizaciones,
            { new: true, runValidators: true }
        )
            .populate('restaurantID', 'nombre')
            .populate('platosAplicables', 'nombre precio');

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Evento actualizado exitosamente',
            data: evento
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar evento',
            error: error.message
        });
    }
};

/**
 * Activar un evento
 * Endpoint: PUT /events/:id/activate
 * Acceso: Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del evento
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con evento activado
 */
export const activateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const evento = await Event.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        ).populate('restaurantID', 'nombre');

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Evento activado exitosamente',
            data: evento
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al activar evento',
            error: error.message
        });
    }
};

/**
 * Desactivar un evento
 * Endpoint: PUT /events/:id/deactivate
 * Acceso: Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del evento
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con evento desactivado
 */
export const deactivateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const evento = await Event.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        ).populate('restaurantID', 'nombre');

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Evento desactivado exitosamente',
            data: evento
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al desactivar evento',
            error: error.message
        });
    }
};

/**
 * Eliminar un evento (soft delete)
 * Endpoint: DELETE /events/:id
 * Acceso: Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del evento
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con confirmación
 */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const evento = await Event.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Evento eliminado exitosamente',
            data: evento
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar evento',
            error: error.message
        });
    }
};

/**
 * Registrar el uso de una promoción
 * Endpoint: POST /events/:id/usar
 * Acceso: Requiere autenticación (puede ser CLIENT, RESTAURANT_ADMIN, PLATFORM_ADMIN)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del evento
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con evento actualizado
 */
export const useEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const evento = await Event.findById(id);

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Verificar si puede usarse
        if (!evento.puedeUsarse()) {
            return res.status(400).json({
                success: false,
                message: 'Esta promoción no es válida o ha alcanzado el máximo de usos'
            });
        }

        // Incrementar uso
        await evento.incrementarUsos();

        res.status(200).json({
            success: true,
            message: 'Promoción aplicada exitosamente',
            data: evento,
            descuento: {
                tipo: evento.descuentoTipo,
                valor: evento.descuentoValor
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al aplicar promoción',
            error: error.message
        });
    }
};

/**
 * Obtener eventos vigentes de un restaurante
 * Endpoint: GET /events/restaurant/:restaurantID/vigentes
 * Acceso: Público
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.restaurantID - ID del restaurante
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con eventos vigentes
 */
export const getEventosVigentes = async (req, res) => {
    try {
        const { restaurantID } = req.params;

        const ahora = new Date();

        const eventos = await Event.find({
            restaurantID,
            isActive: true,
            estado: 'ACTIVA',
            fechaInicio: { $lte: ahora },
            fechaFin: { $gte: ahora }
        })
            .populate('platosAplicables', 'nombre precio')
            .sort({ fechaFin: 1 });

        res.status(200).json({
            success: true,
            message: 'Eventos vigentes obtenidos',
            data: eventos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos vigentes',
            error: error.message
        });
    }
};
