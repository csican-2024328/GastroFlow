import Order from './order.model.js';
import Plato from '../Platos/platos-model.js';
import Mesa from '../Mesas/mesa.model.js';
import Coupon from '../Coupon/coupon.model.js';
import { notifyNewOrder, notifyOrderStatusChange } from '../../configs/socket.js';


const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `ORD-${year}${month}${day}-${random}`;
};


export const createOrder = async (req, res) => {
    try {
        const {
            tipoPedido,
            restaurantID,
            mesaID,
            clienteNombre,
            clienteTelefono,
            clienteDireccion,
            clienteReferencia,
            horaProgramada,
            items,
            impuesto = 0,
            descuento = 0,
            couponCode,
            notas
        } = req.body;

        // Validar tipoPedido
        if (!tipoPedido || !['EN_MESA', 'A_DOMICILIO', 'PARA_LLEVAR'].includes(tipoPedido)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de pedido inválido. Debe ser: EN_MESA, A_DOMICILIO o PARA_LLEVAR'
            });
        }

        // Validaciones específicas por tipo de pedido
        if (tipoPedido === 'EN_MESA') {
            if (!mesaID) {
                return res.status(400).json({
                    success: false,
                    message: 'mesaID es requerido para pedidos EN_MESA'
                });
            }

            const mesa = await Mesa.findById(mesaID);
            if (!mesa || !mesa.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Mesa no encontrada o inactiva'
                });
            }
        }

        if (tipoPedido === 'A_DOMICILIO') {
            if (!clienteDireccion) {
                return res.status(400).json({
                    success: false,
                    message: 'clienteDireccion es requerida para pedidos A_DOMICILIO'
                });
            }
        }

        if (tipoPedido === 'PARA_LLEVAR') {
            if (!horaProgramada) {
                return res.status(400).json({
                    success: false,
                    message: 'horaProgramada es requerida para pedidos PARA_LLEVAR'
                });
            }
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

            if (coupon.restaurantID && coupon.restaurantID.toString() !== restaurantID) {
                return res.status(400).json({
                    success: false,
                    message: 'Este cupón no aplica a este restaurante'
                });
            }

            const validacion = coupon.esValido();
            if (!validacion.valido) {
                return res.status(400).json({
                    success: false,
                    message: `Cupón no válido: ${validacion.razon}`
                });
            }

            const subtotalCalculado = orderItems.reduce((acc, item) => acc + item.subtotal, 0);
            if (subtotalCalculado < coupon.montoMinimo) {
                return res.status(400).json({
                    success: false,
                    message: `Monto mínimo requerido: ${coupon.montoMinimo}`
                });
            }

            descuentoPorCoupon = coupon.calcularDescuento(subtotalCalculado);
        }

        // Crear el pedido
        const newOrder = new Order({
            numeroOrden,
            tipoPedido,
            restaurantID,
            mesaID: tipoPedido === 'EN_MESA' ? mesaID : null,
            clienteNombre,
            clienteTelefono,
            clienteDireccion: tipoPedido === 'A_DOMICILIO' ? clienteDireccion : null,
            clienteReferencia: tipoPedido === 'A_DOMICILIO' ? clienteReferencia : null,
            horaProgramada: tipoPedido === 'PARA_LLEVAR' ? horaProgramada : null,
            items: orderItems,
            impuesto: impuesto || 0,
            descuento: (descuento || 0) + descuentoPorCoupon,
            couponCode: coupon ? coupon.codigo : null,
            couponID: coupon ? coupon._id : null,
            descuentoPorCoupon,
            notas,
            estado: 'EN_PREPARACION'
        });

        await newOrder.save();

        if (coupon) {
            const usuarioID = req.usuario?.sub || req.usuario?.id || null;
            await coupon.registrarUso(usuarioID || 'ANONIMO');
        }

        await newOrder.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' },
            { path: 'items.plato', select: 'nombre precio categoria' }
        ]);

        // Notificar al admin del restaurante sobre nuevo pedido
        notifyNewOrder(restaurantID, {
            _id: newOrder._id,
            numeroOrden: newOrder.numeroOrden,
            tipoPedido: newOrder.tipoPedido,
            clienteNombre: newOrder.clienteNombre,
            items: newOrder.items,
            total: newOrder.total,
            estado: newOrder.estado,
            mesa: newOrder.mesaID
        });

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


const VALID_TRANSITIONS = {
    'EN_PREPARACION': ['LISTO', 'CANCELADO'],
    'LISTO': ['ENTREGADO', 'CANCELADO'],
    'ENTREGADO': [],
    'CANCELADO': []
};

const FINAL_STATES = ['ENTREGADO', 'CANCELADO'];


const isValidStateTransition = (estadoActual, estadoNuevo) => {
    const transicionesValidas = VALID_TRANSITIONS[estadoActual];
    return transicionesValidas && transicionesValidas.includes(estadoNuevo);
};

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

        
        if (FINAL_STATES.includes(order.estado)) {
            return res.status(400).json({
                success: false,
                message: `No se puede cambiar el estado de un pedido ${order.estado}`
            });
        }

        
        if (!isValidStateTransition(order.estado, estado)) {
            return res.status(400).json({
                success: false,
                message: `Transición inválida: no se puede cambiar de ${order.estado} a ${estado}`,
                estadoActual: order.estado,
                transicionesValidas: VALID_TRANSITIONS[order.estado]
            });
        }

        order.estado = estado;

        // Registrar timestamp según el estado y tipo de pedido
        if (estado === 'ENTREGADO') {
            if (order.tipoPedido === 'A_DOMICILIO') {
                order.horaEntregaDomicilio = new Date();
            } else {
                order.horaEntrega = new Date();
            }
        } else if (estado === 'CANCELADO') {
            order.horaCancelacion = new Date();
        }

        await order.save();

        await order.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' }
        ]);

        // Notificar al cliente sobre cambio de estado
        const clientID = req.usuario?.sub || 'GUEST';
        notifyOrderStatusChange(clientID, {
            _id: order._id,
            numeroOrden: order.numeroOrden,
            estado: order.estado,
            tipoPedido: order.tipoPedido,
            total: order.total
        });

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


export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            clienteNombre,
            clienteTelefono,
            clienteDireccion,
            clienteReferencia,
            horaProgramada,
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

        if (order.estado !== 'EN_PREPARACION') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden editar pedidos en estado EN_PREPARACION'
            });
        }

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

        // Actualizar campos según tipo de pedido
        if (clienteNombre) order.clienteNombre = clienteNombre;
        if (clienteTelefono) order.clienteTelefono = clienteTelefono;
        
        if (order.tipoPedido === 'A_DOMICILIO') {
            if (clienteDireccion) order.clienteDireccion = clienteDireccion;
            if (clienteReferencia !== undefined) order.clienteReferencia = clienteReferencia;
        }

        if (order.tipoPedido === 'PARA_LLEVAR') {
            if (horaProgramada) order.horaProgramada = horaProgramada;
        }

        if (impuesto !== undefined) order.impuesto = impuesto;
        if (descuento !== undefined) order.descuento = descuento;
        if (notas !== undefined) order.notas = notas;

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

        // Solo se puede pagar pedidos en estado ENTREGADO
        if (order.estado !== 'ENTREGADO') {
            return res.status(400).json({
                success: false,
                message: `Pedido debe estar en estado ENTREGADO para ser pagado. Estado actual: ${order.estado}`
            });
        }

        order.metodoPago = metodoPago;

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

        // Validar que se pueda cancelar desde el estado actual
        if (!isValidStateTransition(order.estado, 'CANCELADO')) {
            return res.status(400).json({
                success: false,
                message: `No se puede cancelar un pedido en estado ${order.estado}`
            });
        }

        order.estado = 'CANCELADO';
        order.horaCancelacion = new Date();
        
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
