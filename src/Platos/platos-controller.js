/**
 * @fileoverview Controlador de Platos
 * Maneja toda la lógica de negocio para crear, obtener, actualizar y cambiar estado de platos
 * Incluye validaciones, manejo de errores y respuestas HTTP estandarizadas
 */

import { parse } from 'dotenv';
import Plato from '../platos-model.js';

/**
 * Obtiene el menú (platos activos) de un restaurante específico
 * Endpoint: GET /menu/:restaurantID
 * Acceso: Público (sin autenticación requerida)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.restaurantID - ID único del restaurante
 * @param {number} [req.query.page=1] - Número de página para paginación
 * @param {number} [req.query.limit=10] - Cantidad de platos por página
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con:
 *  - success (boolean): Indica si la operación fue exitosa
 *  - message (string): Mensaje descriptivo
 *  - data (Array): Lista de platos activos del restaurante
 *  - pagination (Object): Info de paginación (total, pages, currentPage)
 * 
 * @example
 * GET /menu/507f1f77bcf86cd799439011?page=1&limit=10
 * Response: { success: true, data: [...], pagination: {...} }
 */
export const getMenuByRestaurant = async (req, res) => {
    try {
        // Extrae el ID del restaurante de los parámetros de la URL
        const { restaurantID } = req.params;
        // Extrae parámetros de paginación de la query string (con valores por defecto)
        const { page = 1, limit = 10 } = req.query;

        // Valida que el restaurantID no esté vacío
        if (!restaurantID) {
            return res.status(400).json({
                success: false,
                message: 'ID del restaurante es requerido'
            })
        }

        // Configura opciones de paginación y ordenamiento
        const options = {
            page: parseInt(page),                    // Convierte a número entero
            limit: parseInt(limit),                  // Convierte a número entero
            sort: { createdAt: -1 }                  // Ordena por más reciente primero
        }

        // Busca platos activos (isActive: true) del restaurante específico con paginación
        const platos = await Plato.paginate(
            { restaurantID, isActive: true },
            options
        );

        // Responde con los platos encontrados y detalles de paginación
        res.status(200).json({
            success: true,
            message: 'Menú obtenido exitosamente',
            data: platos.docs,                        // Array de documentos (platos)
            pagination: {
                total: platos.total,                  // Total de platos en BD
                pages: platos.pages,                  // Total de páginas disponibles
                currentPage: platos.page              // Página actual solicitada
            }
        })

    } catch (error) {
        // Captura cualquier error durante la búsqueda
        res.status(500).json({
            success: false,
            message: 'Error al obtener el menú',
            error: error.message
        })
    }
}

/**
 * Crea un nuevo plato en la base de datos
 * Endpoint: POST /create
 * Acceso: Protegido (requiere autenticación)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos del plato (nombre, descripción, precio, ingredientes, etc.)
 * @param {Object} [req.file] - Archivo de imagen cargado (opcional)
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con:
 *  - success (boolean): true si se creó exitosamente
 *  - message (string): Confirmación del creación
 *  - data (Object): Objeto del plato creado con ID generado
 * 
 * @example
 * POST /create
 * Body: { nombre: "Pizza", descripción: "...", precio: 25.50, ... }
 * Response: { success: true, data: { _id: "...", nombre: "Pizza", ... } }
 */
export const createPlato = async (req, res) => {
    try {
        // Copia los datos del plato desde el cuerpo de la solicitud
        const platoData = req.body;

        // Si se cargó una imagen, asigna la ruta al objeto de datos
        if (req.file) {
            platoData.foto = req.file.path;
        }

        // Crea una nueva instancia del modelo Plato con los datos
        const plato = new Plato(platoData);
        // Guarda el documento en la base de datos (MongoDB)
        await plato.save();

        // Responde con el plato creado y su ID generado automáticamente
        res.status(201).json({
            success: true,
            message: 'Plato creado exitosamente',
            data: plato
        })

    } catch (error) {
        // Si hay error de validación o BD, retorna error 400
        res.status(400).json({
            success: false,
            message: 'Error al crear plato',
            error: error.message
        })
    }
}


export const getPlatos = async (req, res) => {

    try {
        // Extrae los parámetros de query con valores por defecto
        const { page = 1, limit = 10, isActive = true, restaurantID, categoria } = req.query;

        // Inicia el objeto filtro con el estado activo
        const filter = { isActive };

        // Si se proporciona restaurantID, lo añade al filtro
        if (restaurantID) {
            filter.restaurantID = restaurantID;
        }

        // Si se proporciona categoría, lo añade al filtro
        if (categoria) {
            filter.categoria = categoria;
        }

        // Configura opciones de paginación y ordenamiento
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        // Busca platos con el filtro, incluye datos del restaurante relacionado,
        // aplica límite, omite (skip) registros según la página, y ordena
        const platos = await Plato.find(filter)
            .populate('restaurantID')                // Incluye datos del restaurante
            .limit(limit * 1)                        // Limita resultados por página
            .skip((page - 1) * limit)                // Salta los registros de páginas anteriores
            .sort(options.sort);                     // Ordena de más reciente a más antiguo

        // Cuenta el total de documentos que coinciden con el filtro
        const total = await Plato.countDocuments(filter);

        // Responde con los platos y detalles de paginación
        res.status(200).json({
            success: true,
            data: platos,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
            }
        })
    } catch (error) {
        // Captura cualquier error en la búsqueda
        res.status(500).json({
            success: false,
            message: 'Error al obtener los platos',
            error: error.message
        })
    }

}

/**
 * Obtiene un plato específico por su ID
 * Endpoint: GET /:id
 * Acceso: Público (sin autenticación requerida)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID único del plato
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con:
 *  - success (boolean): true si se encontró el plato
 *  - data (Object): Objeto del plato con todos sus datos
 *  - message (string): Mensaje de error si no se encontró (opcional)
 * 
 * @example
 * GET /507f1f77bcf86cd799439011
 * Response: { success: true, data: { _id: "...", nombre: "Pizza", ... } }
 */
// Obtener plato por ID
export const getPlatoById = async (req, res) => {
    try {
        // Extrae el ID del plato de los parámetros de la URL
        const { id } = req.params;

        // Busca el plato por ID e incluye datos del restaurante relacionado
        const plato = await Plato.findById(id).populate('restaurantID');

        // Valida si el plato existe
        if (!plato) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado',
            });
        }

        // Responde con el plato encontrado
        res.status(200).json({
            success: true,
            data: plato,
        });
    } catch (error) {
        // Captura errores de búsqueda
        res.status(500).json({
            success: false,
            message: 'Error al obtener el plato',
            error: error.message,
        });
    }
};


/**
 * Actualiza los datos de un plato existente
 * Endpoint: PUT /:id
 * Acceso: Protegido (requiere autenticación)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID único del plato a actualizar
 * @param {Object} req.body - Datos a actualizar del plato
 * @param {Object} [req.file] - Nueva imagen del plato (opcional)
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con:
 *  - success (boolean): true si se actualizó exitosamente
 *  - message (string): Confirmación de actualización
 *  - data (Object): Plato actualizado con los nuevos datos
 * 
 * @example
 * PUT /507f1f77bcf86cd799439011
 * Body: { nombre: "Pizza Premium", precio: 30 }
 * Response: { success: true, data: { _id: "...", nombre: "Pizza Premium", ... } }
 */
// Actualizar plato
export const updatePlato = async (req, res) => {
    try {
        // Extrae el ID del plato de los parámetros
        const { id } = req.params;

        // Busca el plato actual en la BD para verificar que existe
        const currentPlato = await Plato.findById(id);
        if (!currentPlato) {
            return res.status(404).json({
                success: false,
                message: "Plato no encontrado",
            });
        }

        // Copia los datos a actualizar desde el cuerpo de la solicitud
        const updateData = { ...req.body };

        // Si se cargó una nueva imagen
        if (req.file) {
            // Elimina la imagen antigua de Cloudinary si existe
            if (currentPlato.foto_public_id) {
                await cloudinary.uploader.destroy(currentPlato.foto_public_id);
            }

            // Asigna la nueva imagen
            updateData.foto = req.file.path;
            updateData.foto_public_id = req.file.filename;
        }

        // Actualiza el plato con los nuevos datos, retorna el documento actualizado
        // y ejecuta los validadores del esquema
        const updatedPlato = await Plato.findByIdAndUpdate(id, updateData, {
            new: true,                  // Retorna el documento actualizado
            runValidators: true,        // Ejecuta validadores del esquema
        });

        // Responde con el plato actualizado
        res.status(200).json({
            success: true,
            message: "Plato actualizado exitosamente",
            data: updatedPlato,
        });
    } catch (error) {
        // Captura errores de actualización
        res.status(500).json({
            success: false,
            message: "Error al actualizar plato",
            error: error.message,
        });
    }
};


/**
 * Cambia el estado de un plato (activar o desactivar)
 * Endpoints: 
 *   - PUT /:id/activate (activa un plato)
 *   - PUT /:id/deactivate (desactiva un plato)
 * Acceso: Protegido (requiere autenticación)
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID único del plato
 * @param {string} req.url - URL de la solicitud (contiene 'activate' o 'deactivate')
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con:
 *  - success (boolean): true si se cambió el estado exitosamente
 *  - message (string): Confirmación con el nuevo estado
 *  - data (Object): Plato con el estado actualizado
 * 
 * @example
 * PUT /507f1f77bcf86cd799439011/activate
 * Response: { success: true, message: "Plato activado exitosamente", data: {...} }
 */
// Cambiar estado del plato (activar/desactivar)
export const changePlatoStatus = async (req, res) => {
    try {
        // Extrae el ID del plato de los parámetros
        const { id } = req.params;
        
        // Detecta si la URL contiene '/activate' para determinar el nuevo estado
        const isActive = req.url.includes('/activate');
        // Define el texto del mensaje según la acción
        const action = isActive ? 'activado' : 'desactivado';

        // Busca y actualiza el plato con el nuevo estado
        // new: true retorna el documento actualizado
        const plato = await Plato.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        // Valida si el plato existe
        if (!plato) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado',
            });
        }

        // Responde con el plato actualizado y el nuevo estado
        res.status(200).json({
            success: true,
            message: `Plato ${action} exitosamente`,
            data: plato,
        });
    } catch (error) {
        // Captura errores durante el cambio de estado
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del plato',
            error: error.message,
        });
    }
};
