/**
 * @fileoverview Controlador de Pedidos (Orders)
 * Maneja toda la lógica de negocio para crear, obtener, actualizar, cambiar estado y eliminar pedidos
 * Incluye validaciones, manejo de errores, cálculos automáticos y respuestas HTTP estandarizadas
 */

import Order from './order.model.js';
import Plato from '../Platos/platos-model.js';
import Mesa from '../Mesas/mesa.model.js';
import Coupon from '../Coupon/coupon.model.js';

/**
 * Genera un número de orden único basado en timestamp y random
 * @returns {string} Número de orden único (formato: ORD-YYYYMMDD-XXXXX)
 */
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Crea un nuevo pedido
 * Endpoint: POST /orders/create
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.body.restaurantID - ID del restaurante
 * @param {string} req.body.mesaID - ID de la mesa
 * @param {string} req.body.clienteNombre - Nombre del cliente
 * @param {string} [req.body.clienteTelefono] - Teléfono del cliente
 * @param {Array} req.body.items - Lista de items del pedido
 * @param {string} req.body.items[].plato - ID del plato
 * @param {number} req.body.items[].cantidad - Cantidad del plato
 * @param {string} [req.body.items[].notas] - Notas específicas del item
 * @param {number} [req.body.impuesto=0] - Impuesto aplicado
 * @param {number} [req.body.descuento=0] - Descuento aplicado
 * @param {string} [req.body.notas] - Notas generales del pedido
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con:
 *  - success (boolean): Indica si la operación fue exitosa
 *  - message (string): Mensaje descriptivo
 *  - data (Object): Datos del pedido creado
 * 
 * @example
 * POST /orders/create
 * Body: {
 *   "restaurantID": "507f1f77bcf86cd799439011",
 *   "mesaID": "507f1f77bcf86cd799439012",
 *   "clienteNombre": "Juan Pérez",
 *   "clienteTelefono": "50212345678",
 *   "items": [
 *     { "plato": "507f1f77bcf86cd799439013", "cantidad": 2, "notas": "Sin cebolla" }
 *   ],
 *   "impuesto": 10.50,
 *   "descuento": 5.00
 * }
 * Response: { success: true, data: {...} }
 */
export const createOrder = async (req, res) => {
    try {
        const {
            restaurantID,
            mesaID,
            clienteNombre,
            clienteTelefono,
            items,
            impuesto = 0,
            descuento = 0,
            couponCode,
            notas
        } = req.body;

        // Validar que la mesa existe y está activa
        const mesa = await Mesa.findById(mesaID);
        if (!mesa || !mesa.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada o inactiva'
            });
        }

        // Validar y obtener información de cada plato
        const orderItems = [];
        for (const item of items) {
            const plato = await Plato.findById(item.plato);
            
            if (!plato || !plato.isActive) {
                return res.status(404).json({
                    success: false,
                    message: `Plato con ID ${item.plato} no encontrado o inactivo`
                });
            }

            if (!plato.disponible) {
                return res.status(400).json({
                    success: false,
                    message: `El plato "${plato.nombre}" no está disponible en este momento`
                });
            }

            orderItems.push({
                plato: plato._id,
                nombre: plato.nombre,
                cantidad: item.cantidad,
                precioUnitario: plato.precio,
                subtotal: plato.precio * item.cantidad,
                notas: item.notas || ''
            });
        }

        // Generar número de orden único
        let numeroOrden = generateOrderNumber();
        let orderExists = await Order.findOne({ numeroOrden });
        
        // En caso de colisión (muy improbable), generar uno nuevo
        while (orderExists) {
            numeroOrden = generateOrderNumber();
            orderExists = await Order.findOne({ numeroOrden });
        }

        // Validar y aplicar cupón si se envía couponCode
        let coupon = null;
        let descuentoPorCoupon = 0;

        if (couponCode) {
            coupon = await Coupon.findOne({
                codigo: couponCode.toUpperCase(),
                isActive: true
            });

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Cupón no encontrado o inactivo'
                });
            }

            // Verificar si aplica a este restaurante
            if (coupon.restaurantID && coupon.restaurantID.toString() !== restaurantID) {
                return res.status(400).json({
                    success: false,
                    message: 'Este cupón no aplica a este restaurante'
                });
            }

            // Verificar validez del cupón
            const validacion = coupon.esValido();
            if (!validacion.valido) {
                return res.status(400).json({
                    success: false,
                    message: `Cupón no válido: ${validacion.razon}`
                });
            }

            // Calcular subtotal para validar monto mínimo
            const subtotalCalculado = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
            if (subtotalCalculado < coupon.montoMinimo) {
                return res.status(400).json({
                    success: false,
                    message: `Monto mínimo requerido: ${coupon.montoMinimo}`
                });
            }

            // Calcular descuento
            descuentoPorCoupon = coupon.calcularDescuento(subtotalCalculado);
        }

        // Crear el pedido
        const newOrder = new Order({
            numeroOrden,
            restaurantID,
            mesaID,
            clienteNombre,
            clienteTelefono,
            items: orderItems,
            impuesto: impuesto || 0,
            descuento: (descuento || 0) + descuentoPorCoupon,
            couponCode: coupon ? coupon.codigo : null,
            couponID: coupon ? coupon._id : null,
            descuentoPorCoupon,
            notas,
            estado: 'PENDIENTE'
        });

        // El pre-save hook calculará automáticamente subtotal y total
        await newOrder.save();

        // Registrar uso del cupón si se aplicó
        if (coupon) {
            const usuarioID = req.usuario?.sub || req.usuario?.id || null;
            await coupon.registrarUso(usuarioID || 'ANONIMO');
        }

        // Poblar referencias para la respuesta
        await newOrder.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' },
            { path: 'items.plato', select: 'nombre precio categoria' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: newOrder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear el pedido',
            error: error.message
        });
    }
};

/**
 * Obtiene todos los pedidos con filtros opcionales y paginación
 * Endpoint: GET /orders/get
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} [req.query.restaurantID] - Filtrar por restaurante
 * @param {string} [req.query.mesaID] - Filtrar por mesa
 * @param {string} [req.query.estado] - Filtrar por estado
 * @param {number} [req.query.page=1] - Número de página
 * @param {number} [req.query.limit=10] - Cantidad de pedidos por página
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con lista de pedidos y datos de paginación
 * 
 * @example
 * GET /orders/get?estado=PENDIENTE&page=1&limit=10
 * Response: { success: true, data: [...], pagination: {...} }
 */
export const getOrders = async (req, res) => {
    try {
        const {
            restaurantID,
            mesaID,
            estado,
            page = 1,
            limit = 10
        } = req.query;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        // Construir filtro dinámico
        const filter = { isActive: true };
        
        if (restaurantID) filter.restaurantID = restaurantID;
        if (mesaID) filter.mesaID = mesaID;
        if (estado) filter.estado = estado;

        // Ejecutar consulta con paginación
        const orders = await Order.find(filter)
            .populate('restaurantID', 'nombre')
            .populate('mesaID', 'numero ubicacion')
            .populate('items.plato', 'nombre precio categoria')
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: 'Pedidos obtenidos exitosamente',
            data: orders,
            pagination: {
                total,
                pages: Math.ceil(total / parsedLimit),
                currentPage: parsedPage,
                limit: parsedLimit
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los pedidos',
            error: error.message
        });
    }
};

/**
 * Obtiene un pedido específico por su ID
 * Endpoint: GET /orders/:id
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del pedido
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con los datos del pedido
 * 
 * @example
 * GET /orders/507f1f77bcf86cd799439011
 * Response: { success: true, data: {...} }
 */
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('restaurantID', 'nombre email phone')
            .populate('mesaID', 'numero ubicacion capacidad')
            .populate('items.plato', 'nombre descripcion precio categoria');

        if (!order || !order.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pedido obtenido exitosamente',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el pedido',
            error: error.message
        });
    }
};

/**
 * Obtiene un pedido por su número de orden
 * Endpoint: GET /orders/numero/:numeroOrden
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.numeroOrden - Número de orden
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con los datos del pedido
 * 
 * @example
 * GET /orders/numero/ORD-20240215-12345
 * Response: { success: true, data: {...} }
 */
export const getOrderByNumber = async (req, res) => {
    try {
        const { numeroOrden } = req.params;

        const order = await Order.findOne({ numeroOrden, isActive: true })
            .populate('restaurantID', 'nombre email phone')
            .populate('mesaID', 'numero ubicacion capacidad')
            .populate('items.plato', 'nombre descripcion precio categoria');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pedido obtenido exitosamente',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el pedido',
            error: error.message
        });
    }
};

/**
 * Actualiza el estado de un pedido
 * Endpoint: PUT /orders/:id/estado
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del pedido
 * @param {string} req.body.estado - Nuevo estado (PENDIENTE, EN_PREPARACION, LISTO, SERVIDO, PAGADO, CANCELADO)
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con el pedido actualizado
 * 
 * @example
 * PUT /orders/507f1f77bcf86cd799439011/estado
 * Body: { "estado": "EN_PREPARACION" }
 * Response: { success: true, data: {...} }
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const order = await Order.findById(id);

        if (!order || !order.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        // Validar que no se pueda cambiar el estado de un pedido cancelado o pagado
        if (order.estado === 'CANCELADO' || order.estado === 'PAGADO') {
            return res.status(400).json({
                success: false,
                message: `No se puede cambiar el estado de un pedido ${order.estado.toLowerCase()}`
            });
        }

        order.estado = estado;

        // Registrar timestamp según el estado
        if (estado === 'LISTO') {
            order.horaEntrega = new Date();
        } else if (estado === 'PAGADO') {
            order.horaPago = new Date();
        }

        await order.save();

        await order.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Estado del pedido actualizado exitosamente',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado del pedido',
            error: error.message
        });
    }
};

/**
 * Actualiza los datos de un pedido (solo si está en estado PENDIENTE)
 * Endpoint: PUT /orders/:id
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del pedido
 * @param {Object} req.body - Datos a actualizar (items, notas, clienteNombre, etc.)
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con el pedido actualizado
 * 
 * @example
 * PUT /orders/507f1f77bcf86cd799439011
 * Body: { "notas": "Sin picante", "items": [...] }
 * Response: { success: true, data: {...} }
 */
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            clienteNombre,
            clienteTelefono,
            items,
            impuesto,
            descuento,
            notas
        } = req.body;

        const order = await Order.findById(id);

        if (!order || !order.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        // Solo permitir edición si el pedido está en estado PENDIENTE
        if (order.estado !== 'PENDIENTE') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden editar pedidos en estado PENDIENTE'
            });
        }

        // Si se van a actualizar los items, validar y procesar
        if (items && items.length > 0) {
            const orderItems = [];
            for (const item of items) {
                const plato = await Plato.findById(item.plato);
                
                if (!plato || !plato.isActive) {
                    return res.status(404).json({
                        success: false,
                        message: `Plato con ID ${item.plato} no encontrado o inactivo`
                    });
                }

                if (!plato.disponible) {
                    return res.status(400).json({
                        success: false,
                        message: `El plato "${plato.nombre}" no está disponible en este momento`
                    });
                }

                orderItems.push({
                    plato: plato._id,
                    nombre: plato.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: plato.precio,
                    subtotal: plato.precio * item.cantidad,
                    notas: item.notas || ''
                });
            }
            order.items = orderItems;
        }

        // Actualizar otros campos si se proporcionan
        if (clienteNombre) order.clienteNombre = clienteNombre;
        if (clienteTelefono) order.clienteTelefono = clienteTelefono;
        if (impuesto !== undefined) order.impuesto = impuesto;
        if (descuento !== undefined) order.descuento = descuento;
        if (notas !== undefined) order.notas = notas;

        // El pre-save hook recalculará subtotal y total
        await order.save();

        await order.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' },
            { path: 'items.plato', select: 'nombre precio categoria' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Pedido actualizado exitosamente',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el pedido',
            error: error.message
        });
    }
};

/**
 * Registra el pago de un pedido
 * Endpoint: PUT /orders/:id/pagar
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del pedido
 * @param {string} req.body.metodoPago - Método de pago (EFECTIVO, TARJETA, TRANSFERENCIA)
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON con el pedido actualizado
 * 
 * @example
 * PUT /orders/507f1f77bcf86cd799439011/pagar
 * Body: { "metodoPago": "TARJETA" }
 * Response: { success: true, data: {...} }
 */
export const payOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { metodoPago } = req.body;

        const order = await Order.findById(id);

        if (!order || !order.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        if (order.estado === 'CANCELADO') {
            return res.status(400).json({
                success: false,
                message: 'No se puede pagar un pedido cancelado'
            });
        }

        if (order.estado === 'PAGADO') {
            return res.status(400).json({
                success: false,
                message: 'Este pedido ya ha sido pagado'
            });
        }

        order.estado = 'PAGADO';
        order.metodoPago = metodoPago;
        order.horaPago = new Date();

        await order.save();

        await order.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Pago registrado exitosamente',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar el pago',
            error: error.message
        });
    }
};

/**
 * Cancela un pedido (soft delete, marca como inactivo)
 * Endpoint: DELETE /orders/:id
 * Acceso: Requiere autenticación
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del pedido
 * @param {string} [req.body.motivo] - Motivo de la cancelación
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON confirmando la cancelación
 * 
 * @example
 * DELETE /orders/507f1f77bcf86cd799439011
 * Body: { "motivo": "Cliente canceló la orden" }
 * Response: { success: true, message: "..." }
 */
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        const order = await Order.findById(id);

        if (!order || !order.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        if (order.estado === 'PAGADO') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar un pedido que ya ha sido pagado'
            });
        }

        order.estado = 'CANCELADO';
        if (motivo) {
            order.notas = order.notas 
                ? `${order.notas} | Cancelado: ${motivo}` 
                : `Cancelado: ${motivo}`;
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Pedido cancelado exitosamente',
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cancelar el pedido',
            error: error.message
        });
    }
};

/**
 * Elimina permanentemente un pedido (solo para administradores)
 * Endpoint: DELETE /orders/:id/permanent
 * Acceso: Requiere autenticación y rol de administrador
 * 
 * @async
 * @param {Object} req - Objeto de solicitud Express
 * @param {string} req.params.id - ID del pedido
 * @param {Object} res - Objeto de respuesta Express
 * 
 * @returns {Object} JSON confirmando la eliminación
 * 
 * @example
 * DELETE /orders/507f1f77bcf86cd799439011/permanent
 * Response: { success: true, message: "..." }
 */
export const deleteOrderPermanent = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pedido eliminado permanentemente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el pedido',
            error: error.message
        });
    }
};
