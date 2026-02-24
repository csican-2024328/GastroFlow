import Invoice from './invoice.model.js';
import Order from '../Order/order.model.js';
import Event from '../Event/event.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';

/**
 * Crear una nueva factura
 * Endpoint: POST /invoices/create
 * Acceso: Requiere autenticación
 */
export const createInvoice = async (req, res) => {
    try {
        const {
            orderID,
            eventID,
            restaurantID,
            subtotal,
            propina = 0,
            cargosExtra = 0,
            metodoPago
        } = req.body;

        // Validar que la orden existe si se proporciona
        if (orderID) {
            const order = await Order.findById(orderID);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }
            // Verificar si ya existe una factura para esta orden
            const existingInvoice = await Invoice.findOne({ orderID });
            if (existingInvoice) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una factura para esta orden'
                });
            }
        }

        // Validar que el evento existe si se proporciona
        if (eventID) {
            const event = await Event.findById(eventID);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }
            // Verificar si ya existe una factura para este evento (opcional, dependiendo de la lógica de negocio)
            // Si un evento puede ser pagado múltiples veces por diferentes usuarios, no deberíamos bloquearlo aquí.
            // Asumiremos que un usuario puede pagar su participación en un evento.
        }

        // Validar que el restaurante existe
        const restaurant = await Restaurant.findById(restaurantID);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        // El total se calcula automáticamente en el pre-save hook del modelo
        const nuevaFactura = new Invoice({
            orderID: orderID || null,
            eventID: eventID || null,
            restaurantID,
            userID: req.usuario.sub, // ID del usuario autenticado
            subtotal,
            propina,
            cargosExtra,
            metodoPago,
            estado: 'PAGADA' // Por defecto asumimos que si se factura es porque se pagó, o puede venir en el body
        });

        await nuevaFactura.save();

        res.status(201).json({
            success: true,
            message: 'Factura creada exitosamente',
            data: nuevaFactura
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la factura',
            error: error.message
        });
    }
};

/**
 * Obtener todas las facturas (con filtros y paginación)
 * Endpoint: GET /invoices/get
 * Acceso: Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 * Nota: Este endpoint servirá a futuro para generar reportes PDF
 */
export const getInvoices = async (req, res) => {
    try {
        const { restaurantID, estado, metodoPago, fechaInicio, fechaFin, page = 1, limit = 10 } = req.query;

        let filtro = { isActive: true };

        if (restaurantID) filtro.restaurantID = restaurantID;
        if (estado) filtro.estado = estado;
        if (metodoPago) filtro.metodoPago = metodoPago;
        
        // Filtro por rango de fechas
        if (fechaInicio || fechaFin) {
            filtro.fechaEmision = {};
            if (fechaInicio) filtro.fechaEmision.$gte = new Date(fechaInicio);
            if (fechaFin) filtro.fechaEmision.$lte = new Date(fechaFin);
        }

        const facturas = await Invoice.find(filtro)
            .populate('orderID')
            .populate('eventID')
            .populate('restaurantID', 'nombre')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ fechaEmision: -1 });

        const total = await Invoice.countDocuments(filtro);

        res.status(200).json({
            success: true,
            message: 'Facturas obtenidas exitosamente',
            data: facturas,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las facturas',
            error: error.message
        });
    }
};

/**
 * Obtener una factura por ID
 * Endpoint: GET /invoices/:id
 * Acceso: Requiere autenticación
 */
export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const factura = await Invoice.findById(id)
            .populate('orderID')
            .populate('eventID')
            .populate('restaurantID', 'nombre direccion telefono');

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: factura
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la factura',
            error: error.message
        });
    }
};

/**
 * Actualizar el estado de una factura
 * Endpoint: PUT /invoices/:id/status
 * Acceso: Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
export const updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const factura = await Invoice.findByIdAndUpdate(
            id,
            { estado },
            { new: true, runValidators: true }
        );

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Estado de factura actualizado exitosamente',
            data: factura
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado de la factura',
            error: error.message
        });
    }
};

/**
 * Eliminar una factura (soft delete)
 * Endpoint: DELETE /invoices/:id
 * Acceso: Requiere autenticación (PLATFORM_ADMIN)
 */
export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const factura = await Invoice.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Factura eliminada exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la factura',
            error: error.message
        });
    }
};
