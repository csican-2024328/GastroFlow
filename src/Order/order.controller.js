import Order from './order.model.js';
import Plato from '../Platos/platos-model.js';
import Menu from '../Menu/menu.model.js';
import Mesa from '../Mesas/mesa.model.js';
import Coupon from '../Coupon/coupon.model.js';
import Event from '../Event/event.model.js';
import Invoice from '../Invoice/invoice.model.js';
import { notifyNewOrder, notifyOrderStatusChange } from '../../configs/socket.js';
import {
    buildOrderIngredientRequirements,
    getStockShortages,
    reserveInventoryAtomically,
    releaseInventoryForOrder
} from '../../helper/stock-engine.js';


const buildOrderItemsFromPayload = async (items, restaurantId) => {
    const orderItems = [];

    for (const item of items) {
        if (!item.tipo || !['PLATO', 'MENU'].includes(item.tipo)) {
            throw new Error('El tipo de item debe ser PLATO o MENU');
        }

        const quantity = Number(item.cantidad || 1);
        let itemData = null;
        let nombre = '';
        let precioUnitario = 0;

        if (item.tipo === 'PLATO') {
            if (!item.plato) {
                throw new Error('El ID del plato es obligatorio cuando tipo es PLATO');
            }

            const plato = await Plato.findById(item.plato);
            if (!plato || !plato.isActive) {
                throw new Error(`Plato con ID ${item.plato} no encontrado o inactivo`);
            }

            if (restaurantId && plato.restaurantId?.toString() !== restaurantId) {
                throw new Error(`El plato "${plato.nombre}" no pertenece al restaurante seleccionado`);
            }

            itemData = { plato: plato._id };
            nombre = plato.nombre;
            precioUnitario = plato.precio;
        } else {
            if (!item.menu) {
                throw new Error('El ID del menú es obligatorio cuando tipo es MENU');
            }

            const menu = await Menu.findById(item.menu);
            if (!menu || !menu.isActive) {
                throw new Error(`Menú con ID ${item.menu} no encontrado o inactivo`);
            }

            if (restaurantId && menu.restaurantId?.toString() !== restaurantId) {
                throw new Error(`El menú "${menu.nombre}" no pertenece al restaurante seleccionado`);
            }

            itemData = { menu: menu._id };
            nombre = menu.nombre;
            precioUnitario = menu.precio;
        }

        orderItems.push({
            tipo: item.tipo,
            ...itemData,
            nombre,
            cantidad: quantity,
            precioUnitario,
            subtotal: precioUnitario * quantity,
            notas: item.notas || ''
        });
    }

    return orderItems;
};

const requirementsToDelta = (currentRequirements, nextRequirements) => {
    const increase = new Map();
    const release = new Map();
    const ingredientIds = new Set([
        ...currentRequirements.keys(),
        ...nextRequirements.keys()
    ]);

    for (const ingredientId of ingredientIds) {
        const currentQty = currentRequirements.get(ingredientId) || 0;
        const nextQty = nextRequirements.get(ingredientId) || 0;
        const diff = nextQty - currentQty;

        if (diff > 0) {
            increase.set(ingredientId, diff);
        } else if (diff < 0) {
            release.set(ingredientId, Math.abs(diff));
        }
    }

    return { increase, release };
};

const reserveInventoryForOrder = async ({ requirementsMap, restaurantId, orderId, userId }) => {
    if (!requirementsMap || requirementsMap.size === 0) {
        return;
    }

    const reserveResult = await reserveInventoryAtomically({
        requirementsMap,
        restaurantId,
        orderId,
        userId
    });

    if (!reserveResult.success) {
        const err = new Error(reserveResult.message || 'Stock insuficiente');
        err.faltantes = reserveResult.faltantes || [];
        throw err;
    }
};

const releaseInventoryForExistingOrder = async ({ requirementsMap, restaurantId, orderId, userId, motivo }) => {
    if (!requirementsMap || requirementsMap.size === 0) {
        return;
    }

    await releaseInventoryForOrder({
        requirementsMap,
        restaurantId,
        orderId,
        userId,
        motivo
    });
};

export const checkOrderStock = async (req, res) => {
    try {
        const { items } = req.body;
        const restaurantId = req.body.restaurantId || req.body.restaurantID;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items del pedido son requeridos y deben ser un array no vacío'
            });
        }

        const buildResult = await buildOrderIngredientRequirements(items, restaurantId);
        if (!buildResult.success) {
            return res.status(400).json({ success: false, message: buildResult.message });
        }

        const shortageResult = await getStockShortages(buildResult.requirements, restaurantId);

        if (shortageResult.restaurantMismatches?.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El pedido contiene ingredientes de otro restaurante',
                mismatches: shortageResult.restaurantMismatches
            });
        }

        if (shortageResult.hasShortage) {
            return res.status(409).json({
                success: false,
                message: 'Stock insuficiente para completar la orden',
                faltantes: shortageResult.faltantes
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Stock suficiente para completar la orden'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al verificar stock para la orden',
            error: error.message
        });
    }
};


const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Busca y aplica eventos/promociones vigentes a los menús de la orden
 * @param {string} restaurantID - ID del restaurante
 * @param {Array} orderItems - Items de la orden con sus menús
 * @returns {Object} { evento, descuentoPorEvento }
 */
const buscarYAplicarEvento = async (restaurantID, orderItems) => {
    try {
        const ahora = new Date();
        
        // Obtener IDs de menús en la orden
        const menuIdsEnOrden = orderItems
            .filter(item => item.tipo === 'MENU' && item.menu)
            .map(item => item.menu.toString());
        
        if (menuIdsEnOrden.length === 0) {
            return { evento: null, descuentoPorEvento: 0 };
        }

        // Buscar eventos vigentes que apliquen a estos menús
        const evento = await Event.findOne({
            restaurantID,
            isActive: true,
            estado: 'ACTIVA',
            fechaInicio: { $lte: ahora },
            fechaFin: { $gte: ahora },
            menusAplicables: { $in: menuIdsEnOrden }
        });

        if (!evento || !evento.esVigente() || !evento.puedeUsarse()) {
            return { evento: null, descuentoPorEvento: 0 };
        }

        // Calcular el descuento
        const subtotalMenusEnPromo = orderItems
            .filter(item => item.tipo === 'MENU' && menuIdsEnOrden.includes(item.menu.toString()))
            .reduce((acc, item) => acc + item.subtotal, 0);

        let descuentoPorEvento = 0;
        if (evento.descuentoTipo === 'PORCENTAJE') {
            descuentoPorEvento = subtotalMenusEnPromo * (evento.descuentoValor / 100);
        } else if (evento.descuentoTipo === 'CANTIDAD_FIJA') {
            descuentoPorEvento = evento.descuentoValor;
        }

        return { evento, descuentoPorEvento };
    } catch (error) {
        console.error('Error buscando eventos:', error);
        return { evento: null, descuentoPorEvento: 0 };
    }
};


export const createOrder = async (req, res) => {
    try {
        const {
            tipoPedido,
            restaurantID,
            restaurantId,
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
            notas,
            clienteId
        } = req.body;

        const resolvedRestaurantId = restaurantId || restaurantID;

        if (!resolvedRestaurantId) {
            return res.status(400).json({
                success: false,
                message: 'restaurantId es requerido'
            });
        }

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

        const orderItems = await buildOrderItemsFromPayload(items, resolvedRestaurantId);
        const stockRequirements = req.stockRequirements || (await buildOrderIngredientRequirements(items, resolvedRestaurantId)).requirements;

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

            if (coupon.restaurantID && coupon.restaurantID.toString() !== resolvedRestaurantId) {
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

        // Buscar y aplicar eventos/promociones automáticamente
        let evento = null;
        let descuentoPorEvento = 0;
        const { evento: eventoEncontrado, descuentoPorEvento: descuento_evento } = await buscarYAplicarEvento(resolvedRestaurantId, orderItems);
        evento = eventoEncontrado;
        descuentoPorEvento = descuento_evento;

        // Crear el pedido
        const newOrder = new Order({
            numeroOrden,
            tipoPedido,
            restaurantID: resolvedRestaurantId,
            mesaID: tipoPedido === 'EN_MESA' ? mesaID : null,
            clienteId: clienteId || (req.usuario?.role === 'CLIENT' ? req.usuario?.sub : null),
            clienteNombre,
            clienteTelefono,
            clienteDireccion: tipoPedido === 'A_DOMICILIO' ? clienteDireccion : null,
            clienteReferencia: tipoPedido === 'A_DOMICILIO' ? clienteReferencia : null,
            horaProgramada: tipoPedido === 'PARA_LLEVAR' ? horaProgramada : null,
            items: orderItems,
            impuesto: impuesto || 0,
            descuento: (descuento || 0) + descuentoPorCoupon + descuentoPorEvento,
            couponCode: coupon ? coupon.codigo : null,
            couponID: coupon ? coupon._id : null,
            descuentoPorCoupon,
            eventID: evento ? evento._id : null,
            descuentoPorEvento,
            notas,
            estado: 'EN_PREPARACION'
        });

        await newOrder.save();

        // Descuento de inventario usando el stock ya validado por middleware
        try {
            const userId = req.usuario?.sub || req.usuario?.id || null;
            await reserveInventoryForOrder({
                requirementsMap: stockRequirements,
                restaurantId: resolvedRestaurantId,
                orderId: newOrder._id,
                userId
            });
            newOrder.inventarioDecrementado = true;
            await newOrder.save();
        } catch (stockError) {
            await Order.findByIdAndDelete(newOrder._id);
            return res.status(409).json({
                success: false,
                message: stockError.message || 'No hay stock suficiente para completar la orden',
                faltantes: stockError.faltantes || []
            });
        }

        if (coupon) {
            const usuarioID = req.usuario?.sub || req.usuario?.id || null;
            await coupon.registrarUso(usuarioID || 'ANONIMO');
        }

        // Registrar uso del evento si aplica
        if (evento && evento.puedeUsarse()) {
            await evento.incrementarUsos();
        }

        await newOrder.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' },
            { path: 'items.plato', select: 'nombre precio categoria' },
            { path: 'items.menu', select: 'nombre precio tipo' }
        ]);

        // Notificar al admin del restaurante sobre nuevo pedido
        notifyNewOrder(resolvedRestaurantId, {
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
            restaurantId,
            mesaID,
            estado,
            page = 1,
            limit = 10
        } = req.query;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        // Construir filtro dinámico
        const filter = { isActive: true };
        
        if (restaurantId || restaurantID) filter.restaurantID = restaurantId || restaurantID;
        if (mesaID) filter.mesaID = mesaID;
        if (estado) filter.estado = estado;

        // Ejecutar consulta con paginación
        const orders = await Order.find(filter)
            .populate('restaurantID', 'nombre')
            .populate('mesaID', 'numero ubicacion')
            .populate('items.plato', 'nombre precio categoria')
            .populate('items.menu', 'nombre precio tipo')
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

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.usuario?.sub;
        const {
            estado,
            page = 1,
            limit = 10
        } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
        const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);

        // Historial completo del cliente, incluyendo pedidos A_DOMICILIO
        const filter = {
            isActive: true,
            clienteId: userId
        };

        if (estado) {
            filter.estado = estado;
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('restaurantID', 'nombre')
                .populate('mesaID', 'numero ubicacion')
                .populate('items.plato', 'nombre precio categoria')
                .populate('items.menu', 'nombre precio tipo')
                .limit(parsedLimit)
                .skip((parsedPage - 1) * parsedLimit)
                .sort({ createdAt: -1 }),
            Order.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            message: 'Historial de pedidos obtenido exitosamente',
            data: orders,
            pagination: {
                total,
                pages: Math.ceil(total / parsedLimit),
                currentPage: parsedPage,
                limit: parsedLimit
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener historial de pedidos',
            error: error.message
        });
    }
};

export const getMyOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.usuario?.sub;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const order = await Order.findOne({ _id: id, isActive: true, clienteId: userId })
            .populate('restaurantID', 'nombre email phone')
            .populate('mesaID', 'numero ubicacion capacidad')
            .populate('items.plato', 'nombre descripcion precio categoria')
            .populate('items.menu', 'nombre descripcion precio tipo');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Pedido obtenido exitosamente',
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el pedido',
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
            .populate('items.plato', 'nombre descripcion precio categoria')
            .populate('items.menu', 'nombre descripcion precio tipo');

        if (!order || !order.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        if (req.usuario?.role === 'CLIENT' && order.clienteId?.toString() !== req.usuario?.sub) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este pedido'
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
            .populate('items.plato', 'nombre descripcion precio categoria')
            .populate('items.menu', 'nombre descripcion precio tipo');

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
            
            // Restaurar inventario si fue decrementado anteriormente
            if (order.inventarioDecrementado) {
                const userId = req.usuario?.sub || req.usuario?.id || null;
                const restaurantId = order.restaurantID?.toString() || order.restaurantId?.toString() || null;
                const buildResult = await buildOrderIngredientRequirements(order.items, restaurantId);
                if (!buildResult.success) {
                    throw new Error(buildResult.message);
                }

                await releaseInventoryForExistingOrder({
                    requirementsMap: buildResult.requirements,
                    restaurantId,
                    orderId: order._id,
                    userId,
                    motivo: 'ORDER_CANCELADA'
                });
                order.inventarioDecrementado = false;
            }
        }

        await order.save();

        await order.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' }
        ]);

        // Notificar al cliente dueño de la orden sobre cambio de estado
        if (order.clienteId) {
            notifyOrderStatusChange(order.clienteId.toString(), {
                _id: order._id,
                numeroOrden: order.numeroOrden,
                estado: order.estado,
                tipoPedido: order.tipoPedido,
                total: order.total
            });
        }

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

        const restaurantId = order.restaurantID?.toString() || order.restaurantId?.toString() || null;

        if (items && items.length > 0) {
            const currentBuild = await buildOrderIngredientRequirements(order.items, restaurantId);
            if (!currentBuild.success) {
                return res.status(400).json({
                    success: false,
                    message: currentBuild.message
                });
            }

            const nextBuild = req.stockRequirements || await buildOrderIngredientRequirements(items, restaurantId);
            if (!nextBuild.success) {
                return res.status(400).json({
                    success: false,
                    message: nextBuild.message
                });
            }

            const { increase, release } = requirementsToDelta(currentBuild.requirements, nextBuild.requirements);

            if (increase.size > 0) {
                const shortageResult = await getStockShortages(increase, restaurantId);

                if (shortageResult.restaurantMismatches?.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'El pedido contiene ingredientes de otro restaurante',
                        mismatches: shortageResult.restaurantMismatches
                    });
                }

                if (shortageResult.hasShortage) {
                    return res.status(409).json({
                        success: false,
                        message: 'Stock insuficiente para completar la actualización del pedido',
                        faltantes: shortageResult.faltantes
                    });
                }

                const userId = req.usuario?.sub || req.usuario?.id || null;
                await reserveInventoryForOrder({
                    requirementsMap: increase,
                    restaurantId,
                    orderId: order._id,
                    userId
                });
            }

            if (release.size > 0) {
                const userId = req.usuario?.sub || req.usuario?.id || null;
                await releaseInventoryForExistingOrder({
                    requirementsMap: release,
                    restaurantId,
                    orderId: order._id,
                    userId,
                    motivo: 'ORDER_UPDATE'
                });
            }

            order.items = await buildOrderItemsFromPayload(items, restaurantId);
            order.inventarioDecrementado = true;
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
            { path: 'items.plato', select: 'nombre precio categoria' },
            { path: 'items.menu', select: 'nombre precio tipo' }
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
        const { metodoPago, propina = 0, cargosExtra = 0 } = req.body;

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

        // Verificar si la orden ya ha sido pagada (metodoPago no es PENDIENTE)
        if (order.metodoPago !== 'PENDIENTE') {
            return res.status(400).json({
                success: false,
                message: 'Esta orden ya ha sido pagada. No se puede pagar nuevamente'
            });
        }

        // Solo se puede pagar pedidos en estado LISTO o ENTREGADO
        if (!['LISTO', 'ENTREGADO'].includes(order.estado)) {
            return res.status(400).json({
                success: false,
                message: `Pedido debe estar en estado LISTO o ENTREGADO para ser pagado. Estado actual: ${order.estado}`
            });
        }

        order.metodoPago = metodoPago;
        order.propina = propina;
        order.cargosExtra = cargosExtra;

        if (order.estado === 'LISTO') {
            order.estado = 'ENTREGADO';
            if (order.tipoPedido === 'A_DOMICILIO') {
                order.horaEntregaDomicilio = new Date();
            } else {
                order.horaEntrega = new Date();
            }
        }

        await order.save();

        // Actualizar la factura asociada con el método de pago correcto y estado PAGADA
        const invoice = await Invoice.findOne({ orderID: order._id });
        if (invoice) {
            invoice.metodoPago = metodoPago;
            invoice.estado = 'PAGADA';
            await invoice.save();
        }

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
        
        // Restaurar inventario si fue decrementado anteriormente
        if (order.inventarioDecrementado) {
            const userId = req.usuario?.sub || req.usuario?.id || null;
            const restaurantId = order.restaurantID?.toString() || order.restaurantId?.toString() || null;
            const buildResult = await buildOrderIngredientRequirements(order.items, restaurantId);
            if (!buildResult.success) {
                throw new Error(buildResult.message);
            }

            await releaseInventoryForExistingOrder({
                requirementsMap: buildResult.requirements,
                restaurantId,
                orderId: order._id,
                userId,
                motivo: 'ORDER_CANCELADA'
            });
            order.inventarioDecrementado = false;
        }
        
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
