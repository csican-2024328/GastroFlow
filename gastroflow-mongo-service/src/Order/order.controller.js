import Order from './order.model.js';
import Plato from '../Platos/platos-model.js';
import Menu from '../Menu/menu.model.js';
import Mesa from '../Mesas/mesa.model.js';
import Coupon from '../Coupon/coupon.model.js';
import Event from '../Event/event.model.js';
import Invoice from '../Invoice/invoice.model.js';
import PDFDocument from 'pdfkit';
import { notifyNewOrder, notifyOrderStatusChange } from '../../configs/socket.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import Notification from '../Notifications/notification.model.js';
import { enviarEmailPedidoCreado, enviarEmailCambioEstadoPedido, enviarEmailPINEntrega } from '../../helper/email-service.js';
import {
    buildOrderIngredientRequirements,
    getStockShortages,
    reserveInventoryAtomically,
    releaseInventoryForOrder
} from '../../helper/stock-engine.js';

const formatMoney = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const resolveDocumentId = (value) => {
    if (!value) return null;
    if (typeof value === 'object' && value !== null) {
        return String(value._id || value.id || value.toString());
    }
    return String(value);
};

const getOrderInvoiceName = (order) => {
    if (!order) return 'factura-pedido.pdf';

    const orderNumber = order.numeroOrden || order._id?.toString()?.slice(-8).toUpperCase() || 'PEDIDO';
    return `factura-${orderNumber}.pdf`.replace(/\s+/g, '-');
};

const ensureInvoiceForOrder = async (order, metodoPagoOverride = null) => {
    const invoiceData = {
        orderID: order._id,
        restaurantID: resolveDocumentId(order.restaurantID),
        userID: order.clienteId ? String(order.clienteId) : String(order.clienteNombre || order.clienteTelefono || 'CLIENTE'),
        subtotal: Number(order.subtotal || 0),
        impuesto: Number(order.impuesto || 0),
        descuento: Number(order.descuento || 0),
        propina: Number(order.propina || 0),
        cargosExtra: Number(order.cargosExtra || 0),
        metodoPago: metodoPagoOverride || order.metodoPago || 'PENDIENTE',
        estado: (metodoPagoOverride || order.metodoPago) && (metodoPagoOverride || order.metodoPago) !== 'PENDIENTE' ? 'PAGADA' : 'PENDIENTE'
    };

    const existingInvoice = await Invoice.findOne({ orderID: order._id });

    if (existingInvoice) {
        existingInvoice.restaurantID = invoiceData.restaurantID;
        existingInvoice.userID = invoiceData.userID;
        existingInvoice.subtotal = invoiceData.subtotal;
        existingInvoice.impuesto = invoiceData.impuesto;
        existingInvoice.descuento = invoiceData.descuento;
        existingInvoice.propina = invoiceData.propina;
        existingInvoice.cargosExtra = invoiceData.cargosExtra;
        existingInvoice.metodoPago = invoiceData.metodoPago;
        existingInvoice.estado = invoiceData.estado;
        await existingInvoice.save();
        return existingInvoice;
    }

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    return invoice;
};

const writeInvoiceLine = (doc, label, value, y, { bold = false } = {}) => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
    doc.text(label, 340, y, { width: 140, align: 'right' });
    doc.text(value, 490, y, { width: 70, align: 'right' });
};

const buildOrderInvoicePdf = (doc, order, invoice) => {
    const restaurantName = order.restaurantID?.nombre || order.restaurantID?.name || 'Restaurante GastroFlow';
    const customerName = order.clienteNombre || 'Cliente';
    const orderNumber = order.numeroOrden || order._id?.toString()?.slice(-8).toUpperCase() || 'PEDIDO';
    const paymentMethod = invoice?.metodoPago || order.metodoPago || 'PENDIENTE';
    const issueDate = invoice?.fechaEmision || new Date();

    doc.font('Helvetica-Bold').fontSize(20).fillColor('#1A1A1A').text('Factura de pedido', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).fillColor('#4B4B4B');
    doc.text(`Restaurante: ${restaurantName}`);
    doc.text(`Pedido: ${orderNumber}`);
    doc.text(`Fecha de emisión: ${new Date(issueDate).toLocaleString('es-ES')}`);
    doc.text(`Cliente: ${customerName}`);
    doc.text(`Método de pago: ${paymentMethod}`);

    doc.moveDown(1);

    const startX = 40;
    const tableWidth = 515;
    let currentY = doc.y;
    const headerHeight = 22;
    const rowHeight = 22;

    const drawHeader = () => {
        doc.fillColor('#2C4035').rect(startX, currentY, tableWidth, headerHeight).fill();
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
        doc.text('Producto', startX + 8, currentY + 6, { width: 260 });
        doc.text('Cant.', startX + 274, currentY + 6, { width: 50, align: 'right' });
        doc.text('Unit.', startX + 332, currentY + 6, { width: 80, align: 'right' });
        doc.text('Subtotal', startX + 420, currentY + 6, { width: 72, align: 'right' });
        currentY += headerHeight;
    };

    const ensureSpace = () => {
        if (currentY > 720) {
            doc.addPage();
            currentY = 50;
            drawHeader();
        }
    };

    drawHeader();

    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) {
        ensureSpace();
        doc.fillColor('#1A1A1A').font('Helvetica').fontSize(10);
        doc.text('Sin items disponibles', startX + 8, currentY + 6, { width: 474 });
        currentY += rowHeight;
    } else {
        items.forEach((item, index) => {
            ensureSpace();
            const itemName = item.nombre || item.plato?.nombre || item.menu?.nombre || `Item ${index + 1}`;
            const quantity = Number(item.cantidad || 0);
            const unitPrice = Number(item.precioUnitario || 0);
            const subtotal = Number(item.subtotal ?? quantity * unitPrice);

            doc.fillColor(index % 2 === 0 ? '#FAF7F2' : '#F3EEE4').rect(startX, currentY, tableWidth, rowHeight).fill();
            doc.fillColor('#1A1A1A').font('Helvetica').fontSize(10);
            doc.text(itemName, startX + 8, currentY + 6, { width: 260 });
            doc.text(String(quantity), startX + 274, currentY + 6, { width: 50, align: 'right' });
            doc.text(formatMoney(unitPrice), startX + 332, currentY + 6, { width: 80, align: 'right' });
            doc.text(formatMoney(subtotal), startX + 420, currentY + 6, { width: 72, align: 'right' });
            currentY += rowHeight;
        });
    }

    currentY += 18;
    doc.moveTo(startX, currentY).lineTo(startX + tableWidth, currentY).strokeColor('#D9C7AC').stroke();
    currentY += 18;

    const subtotal = Number(invoice?.subtotal ?? order.subtotal ?? 0);
    const impuesto = Number(invoice?.impuesto ?? order.impuesto ?? 0);
    const descuento = Number(invoice?.descuento ?? order.descuento ?? 0);
    const propina = Number(invoice?.propina ?? order.propina ?? 0);
    const cargosExtra = Number(invoice?.cargosExtra ?? order.cargosExtra ?? 0);
    const total = subtotal + impuesto - descuento + propina + cargosExtra;

    writeInvoiceLine(doc, 'Subtotal', formatMoney(subtotal), currentY);
    currentY += 18;
    writeInvoiceLine(doc, 'Impuesto', formatMoney(impuesto), currentY);
    currentY += 18;
    writeInvoiceLine(doc, 'Descuento', `-${formatMoney(descuento)}`, currentY);
    currentY += 18;
    writeInvoiceLine(doc, 'Propina', formatMoney(propina), currentY);
    currentY += 18;
    writeInvoiceLine(doc, 'Cargos extra', formatMoney(cargosExtra), currentY);
    currentY += 18;
    writeInvoiceLine(doc, 'Total pagado', formatMoney(total), currentY, { bold: true });

    doc.moveDown(2);
    doc.font('Helvetica').fontSize(9).fillColor('#6D6459');
    doc.text('Gracias por tu compra. Conserva esta factura para cualquier reclamo o seguimiento.', { align: 'center' });
};


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

/**
 * Parse horaProgramada value which can be:
 * - a Date object
 * - an ISO datetime string
 * - a time-only string like "14:30" (interpreted as today at that time)
 * Returns a Date instance or null if cannot parse
 */
const parseHoraProgramadaValue = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string') {
        // Try ISO parse first
        const iso = new Date(value);
        if (!isNaN(iso.getTime())) return iso;

        // Try HH:MM or H:MM
        const m = value.match(/^(\d{1,2}):(\d{2})$/);
        if (m) {
            const hh = Number(m[1]);
            const mm = Number(m[2]);
            if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) {
                const d = new Date();
                d.setHours(hh, mm, 0, 0);
                return d;
            }
        }
    }
    return null;
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
 * Helper: redondeo a 2 decimales
 */
const discountRound = (value) => Math.round((value + Number.EPSILON) * 100) / 100;


/**
 * Busca y aplica eventos/promociones vigentes considerando menús y platos.
 * Soporta múltiples eventos y devuelve el que produce mayor beneficio económico.
 * @param {string} restaurantID
 * @param {Array} orderItems
 * @returns {Object} { evento, descuentoPorEvento, detallePorItem }
 */
const buscarYAplicarEvento = async (restaurantID, orderItems) => {
    try {
        const ahora = new Date();

        // Obtener todos los eventos vigentes para el restaurante
        const eventos = await Event.find({
            restaurantID,
            isActive: true,
            estado: 'ACTIVA',
            fechaInicio: { $lte: ahora },
            fechaFin: { $gte: ahora }
        });

        if (!eventos || eventos.length === 0) {
            return { evento: null, descuentoPorEvento: 0, detallePorItem: {} };
        }

        const candidatos = [];

        for (const evento of eventos) {
            if (typeof evento.esVigente === 'function' && typeof evento.puedeUsarse === 'function') {
                if (!evento.esVigente() || !evento.puedeUsarse()) continue;
            }

            let descuentoTotal = 0;
            const detalle = {};

            // Primero, marcar qué items son aplicables
            const itemsAplicables = orderItems.filter(it => {
                if (it.tipo === 'MENU' && evento.menusAplicables && evento.menusAplicables.length > 0) {
                    return evento.menusAplicables.map(String).includes(String(it.menu || it.menu?._id || it.menuId));
                }
                if (it.tipo === 'PLATO' && evento.platosAplicables && evento.platosAplicables.length > 0) {
                    return evento.platosAplicables.map(String).includes(String(it.plato || it.plato?._id || it.platoId));
                }
                return false;
            });

            if (itemsAplicables.length === 0) {
                candidatos.push({ evento, descuentoTotal: 0, detalle });
                continue;
            }

            const subtotalAplicables = itemsAplicables.reduce((s, it) => s + (it.subtotal || 0), 0);

            if (evento.descuentoTipo === 'PORCENTAJE') {
                // aplicar porcentaje sobre subtotal de items aplicables
                descuentoTotal = subtotalAplicables * (evento.descuentoValor / 100);
                for (const it of itemsAplicables) {
                    const d = discountRound((it.subtotal || 0) * (evento.descuentoValor / 100));
                    detalle[it.nombre || it.plato || it.menu || it.nombrePlato || it.nombre_menu] = { subtotal: it.subtotal || 0, descuento: d };
                }
            } else if (evento.descuentoTipo === 'CANTIDAD_FIJA') {
                // distribuir monto fijo proporcionalmente
                for (const it of itemsAplicables) {
                    const propor = subtotalAplicables > 0 ? ((it.subtotal || 0) / subtotalAplicables) : 0;
                    const d = discountRound(evento.descuentoValor * propor);
                    detalle[it.nombre || it.plato || it.menu || it.nombrePlato || it.nombre_menu] = { subtotal: it.subtotal || 0, descuento: d };
                    descuentoTotal += d;
                }
            }

            candidatos.push({ evento, descuentoTotal: discountRound(descuentoTotal), detalle });
        }

        // Elegir evento con mayor descuento
        candidatos.sort((a, b) => (b.descuentoTotal || 0) - (a.descuentoTotal || 0));
        const elegido = candidatos[0];
        if (!elegido || !elegido.evento) return { evento: null, descuentoPorEvento: 0, detallePorItem: {} };

        return { evento: elegido.evento, descuentoPorEvento: elegido.descuentoTotal || 0, detallePorItem: elegido.detalle || {} };
    } catch (error) {
        console.error('Error buscando eventos:', error);
        return { evento: null, descuentoPorEvento: 0, detallePorItem: {} };
    }
};


/**
 * Endpoint público para previsualizar eventos y descuentos sin crear el pedido
 */
export const checkOrderEvents = async (req, res) => {
    try {
        const { restaurantID, restaurantId, items } = req.body;
        const resolvedRestaurantId = restaurantId || restaurantID;

        if (!resolvedRestaurantId) return res.status(400).json({ success: false, message: 'restaurantId es requerido' });
        if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'Items son requeridos' });

        const orderItems = await buildOrderItemsFromPayload(items, resolvedRestaurantId);
        const { evento, descuentoPorEvento, detallePorItem } = await buscarYAplicarEvento(resolvedRestaurantId, orderItems);

        if (!evento) {
            return res.status(200).json({ success: true, message: 'No hay eventos aplicables', data: { evento: null, descuento: 0, detalle: {} } });
        }

        return res.status(200).json({ success: true, message: 'Evento aplicable encontrado', data: { evento: { id: evento._id, nombre: evento.nombre, descripcion: evento.descripcion, descuentoTipo: evento.descuentoTipo, descuentoValor: evento.descuentoValor }, descuento: descuentoPorEvento, detalle: detallePorItem } });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al comprobar eventos', error: error.message });
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

            // parse horaProgramada safely (accept "HH:MM" or ISO)
            const parsedHora = parseHoraProgramadaValue(horaProgramada);
            if (!parsedHora) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de horaProgramada inválido. Use HH:MM o ISO datetime'
                });
            }

            // replace value with parsed Date for later saving
            req.body.horaProgramada = parsedHora;
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
        let detalleDescuentoPorItem = {};
        const { evento: eventoEncontrado, descuentoPorEvento: descuento_evento, detallePorItem } = await buscarYAplicarEvento(resolvedRestaurantId, orderItems);
        evento = eventoEncontrado;
        descuentoPorEvento = descuento_evento;
        detalleDescuentoPorItem = detallePorItem || {};

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
            horaProgramada: tipoPedido === 'PARA_LLEVAR' ? req.body.horaProgramada : null,
            items: orderItems,
            impuesto: impuesto || 0,
            descuento: (descuento || 0) + descuentoPorCoupon + descuentoPorEvento,
            couponCode: coupon ? coupon.codigo : null,
            couponID: coupon ? coupon._id : null,
            descuentoPorCoupon,
            eventID: evento ? evento._id : null,
            descuentoPorEvento,
            eventNombre: evento ? evento.nombre : null,
            eventDescuentoTipo: evento ? evento.descuentoTipo : null,
            eventDescuentoValor: evento ? evento.descuentoValor : null,
            descuentoDetalle: detalleDescuentoPorItem,
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

        // Crear notificación persistente para el admin del restaurante (si existe)
        try {
            const restaurant = await Restaurant.findById(resolvedRestaurantId).select('adminId nombre');
            if (restaurant && restaurant.adminId) {
                await Notification.create({
                    userId: String(restaurant.adminId),
                    type: 'NUEVO_PEDIDO',
                    message: `Nuevo pedido ${newOrder.numeroOrden}`,
                    data: { orderId: newOrder._id, restaurantId: resolvedRestaurantId }
                });
            }
        } catch (notifErr) {
            console.error('❌ Error creando notificación persistente para admin:', notifErr.message);
        }

        // Enviar email de confirmación al cliente si disponemos de su email
        try {
            const clientEmail = req.body.clienteEmail || req.usuario?.email || null;
            if (clientEmail) {
                await enviarEmailPedidoCreado({
                    email: clientEmail,
                    nombre: newOrder.clienteNombre,
                    numeroOrden: newOrder.numeroOrden,
                    restaurante: newOrder.restaurantID?.nombre || '',
                    total: newOrder.total
                });
            } else {
                console.warn('⚠️ No se encontró email del cliente para enviar confirmación de pedido');
            }
        } catch (emailErr) {
            console.error('❌ Error enviando email de pedido creado:', emailErr.message);
        }

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
    'PENDIENTE': {
        'EN_MESA': ['EN_PREPARACION', 'CANCELADO'],
        'A_DOMICILIO': ['EN_PREPARACION', 'CANCELADO'],
        'PARA_LLEVAR': ['EN_PREPARACION', 'CANCELADO']
    },
    'EN_PREPARACION': {
        'EN_MESA': ['LISTO', 'CANCELADO'],
        'A_DOMICILIO': ['ENTREGADO_AL_REPARTIDOR', 'CANCELADO'],
        'PARA_LLEVAR': ['LISTO', 'CANCELADO']
    },
    'LISTO': {
        'EN_MESA': ['CANCELADO'],
        'A_DOMICILIO': [],
        'PARA_LLEVAR': ['CANCELADO']
    },
    'ENTREGADO_AL_REPARTIDOR': {
        'A_DOMICILIO': ['ENTREGADO', 'CANCELADO']
    },
    'ENTREGADO': {
        'EN_MESA': [],
        'A_DOMICILIO': [],
        'PARA_LLEVAR': []
    },
    'CANCELADO': {
        'EN_MESA': [],
        'A_DOMICILIO': [],
        'PARA_LLEVAR': []
    }
};

const FINAL_STATES = ['ENTREGADO', 'LISTO', 'CANCELADO'];


const isValidStateTransition = (estadoActual, estadoNuevo, tipoPedido) => {
    const transicionesValidas = VALID_TRANSITIONS[estadoActual];
    if (!transicionesValidas) return false;
    
    const transicionesPorTipo = transicionesValidas[tipoPedido];
    return transicionesPorTipo && transicionesPorTipo.includes(estadoNuevo);
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

        
        if (!isValidStateTransition(order.estado, estado, order.tipoPedido)) {
            return res.status(400).json({
                success: false,
                message: `Transición inválida: no se puede cambiar de ${order.estado} a ${estado} en un pedido ${order.tipoPedido}`,
                estadoActual: order.estado,
                transicionesValidas: VALID_TRANSITIONS[order.estado]?.[order.tipoPedido] || []
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
                    return res.status(400).json({
                        success: false,
                        message: 'Error al calcular requisitos de inventario para restauración',
                        details: buildResult.message,
                        faltantes: buildResult.faltantes || []
                    });
                }

                try {
                    await releaseInventoryForExistingOrder({
                        requirementsMap: buildResult.requirements,
                        restaurantId,
                        orderId: order._id,
                        userId,
                        motivo: 'ORDER_CANCELADA'
                    });
                    order.inventarioDecrementado = false;
                } catch (releaseErr) {
                    const msg = releaseErr && releaseErr.message ? releaseErr.message : 'Error liberando inventario';
                    if (msg === 'RESTAURANT_MISMATCH') {
                        return res.status(400).json({
                            success: false,
                            message: 'Error de consistencia: algunos ingredientes pertenecen a otro restaurante'
                        });
                    }

                    return res.status(500).json({
                        success: false,
                        message: 'Error al restaurar inventario',
                        error: msg
                    });
                }
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

        // Crear notificación persistente para admin del restaurante (si existe)
        try {
            const restaurant = await Restaurant.findById(order.restaurantID?.toString()).select('adminId nombre');
            if (restaurant && restaurant.adminId) {
                await Notification.create({
                    userId: String(restaurant.adminId),
                    type: 'CAMBIO_ESTADO_PEDIDO',
                    message: `Pedido ${order.numeroOrden} cambió a ${order.estado}`,
                    data: { orderId: order._id, estado: order.estado }
                });
            }
        } catch (notifErr) {
            console.error('❌ Error creando notificación persistente para admin tras cambio de estado:', notifErr.message);
        }

        // Enviar email de cambio de estado al cliente (si se proporciona email en body)
        try {
            const clientEmail = req.body.clienteEmail || null;
            if (clientEmail) {
                await enviarEmailCambioEstadoPedido({
                    email: clientEmail,
                    nombre: order.clienteNombre,
                    numeroOrden: order.numeroOrden,
                    nuevoEstado: order.estado
                });
            } else {
                console.warn('⚠️ No se proporcionó clienteEmail en request; no se envió email de estado');
            }
        } catch (emailErr) {
            console.error('❌ Error enviando email de cambio de estado:', emailErr.message);
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

// Generar PIN de entrega para pedido (envía email al cliente)
export const generateDeliveryPIN = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order || !order.isActive) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        // Generar PIN numérico de 6 dígitos
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        order.deliveryPIN = pin;
        order.pinValidated = false;
        order.pinExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        await order.save();

        // Envío de email con el PIN
        const clientEmail = req.body.clienteEmail || req.usuario?.email || null;
        if (clientEmail) {
            try {
                await enviarEmailPINEntrega({
                    email: clientEmail,
                    nombre: order.clienteNombre,
                    numeroOrden: order.numeroOrden,
                    pin
                });
            } catch (emailErr) {
                console.error('❌ Error enviando email PIN:', emailErr.message);
            }
        }

        // Notificar al admin del restaurante en la sala socket
        try {
            notifyNewOrder(order.restaurantID?.toString(), {
                _id: order._id,
                numeroOrden: order.numeroOrden,
                mensaje: 'PIN de entrega generado'
            });
        } catch (err) {
            console.error('❌ Error notificando generación de PIN via socket:', err.message);
        }

        return res.status(200).json({ success: true, message: 'PIN generado y enviado (si hay email disponible)' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error generando PIN', error: error.message });
    }
};

// Confirmar entrega mediante PIN (admin/repartidor valida el PIN y se marca ENTREGADO)
export const confirmDeliveryWithPIN = async (req, res) => {
    try {
        const { id } = req.params;
        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({ success: false, message: 'PIN es requerido' });
        }

        const order = await Order.findById(id);
        if (!order || !order.isActive) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        if (!order.deliveryPIN || !order.pinExpiresAt) {
            return res.status(400).json({ success: false, message: 'No se ha generado un PIN para este pedido' });
        }

        if (new Date() > new Date(order.pinExpiresAt)) {
            return res.status(400).json({ success: false, message: 'El PIN ha expirado' });
        }

        if (String(pin).trim() !== String(order.deliveryPIN).trim()) {
            return res.status(400).json({ success: false, message: 'PIN inválido' });
        }

        // Validado: marcar pedido como ENTREGADO
        order.pinValidated = true;
        order.deliveryPIN = null;
        order.pinExpiresAt = null;
        order.estado = 'ENTREGADO';
        if (order.tipoPedido === 'A_DOMICILIO') {
            order.horaEntregaDomicilio = new Date();
        } else {
            order.horaEntrega = new Date();
        }

        await order.save();

        // Notificar al cliente y al admin
        try {
            if (order.clienteId) {
                notifyOrderStatusChange(String(order.clienteId), {
                    _id: order._id,
                    numeroOrden: order.numeroOrden,
                    estado: order.estado
                });
            }
        } catch (err) {
            console.error('❌ Error notificando estado ENTREGADO vía socket:', err.message);
        }

        // Intentar enviar email de confirmación al cliente si se dispone
        try {
            const clientEmail = req.body.clienteEmail || req.usuario?.email || null;
            if (clientEmail) {
                await enviarEmailCambioEstadoPedido({
                    email: clientEmail,
                    nombre: order.clienteNombre,
                    numeroOrden: order.numeroOrden,
                    nuevoEstado: order.estado
                });
            }
        } catch (emailErr) {
            console.error('❌ Error enviando email de confirmación de entrega:', emailErr.message);
        }

        return res.status(200).json({ success: true, message: 'Entrega confirmada correctamente', data: order });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error confirmando entrega', error: error.message });
    }
};


export const payOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { metodoPago, propina = 0, cargosExtra = 0 } = req.body;
        const requesterId = req.usuario?.sub ? String(req.usuario.sub) : null;

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

        if (req.usuario?.role === 'CLIENT' && order.clienteId?.toString() !== requesterId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para pagar este pedido'
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

        // Asegurar que la factura exista y quede asociada al pago.
        const invoice = await ensureInvoiceForOrder(order, metodoPago);

        if (order.clienteId) {
            notifyOrderStatusChange(order.clienteId.toString(), {
                _id: order._id,
                estado: order.estado,
                metodoPago: order.metodoPago,
                propina: order.propina,
                cargosExtra: order.cargosExtra,
                total: order.total,
                restaurantID: order.restaurantID,
                clienteId: order.clienteId,
            });
        }

        await order.populate([
            { path: 'restaurantID', select: 'nombre' },
            { path: 'mesaID', select: 'numero ubicacion' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Pago registrado exitosamente',
            data: order,
            invoiceId: invoice?._id || null,
            invoicePdfUrl: `/api/v1/orders/${order._id}/invoice/pdf`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar el pago',
            error: error.message
        });
    }
};

export const downloadOrderInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.usuario?.sub ? String(req.usuario.sub) : null;

        const order = await Order.findById(id)
            .populate('restaurantID', 'nombre name direccion telefono')
            .populate('mesaID', 'numero ubicacion');

        if (!order || !order.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        if (req.usuario?.role === 'CLIENT' && order.clienteId?.toString() !== requesterId) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para descargar esta factura'
            });
        }

        if (order.metodoPago === 'PENDIENTE') {
            return res.status(400).json({
                success: false,
                message: 'La factura solo está disponible después de registrar el pago'
            });
        }

        const invoice = await ensureInvoiceForOrder(order, order.metodoPago);

        const fileName = getOrderInvoiceName(order);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        doc.on('error', (error) => {
            console.error('Error generating invoice PDF:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error al generar la factura PDF'
                });
            } else {
                res.destroy(error);
            }
        });

        doc.pipe(res);
        buildOrderInvoicePdf(doc, order, invoice);
        doc.end();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al descargar la factura PDF',
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
