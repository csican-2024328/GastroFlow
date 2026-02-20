import mongoose from 'mongoose';

export const topPlatos = async (req, res, next) => {
    try {
        const resultado = await mongoose.model('Mesa').aggregate([
            { $match: { estado: 'CERRADA' } },

            { $unwind: '$platos' },

            {
                $group: {
                    _id: '$platos.plato',
                    nombre: { $first: '$platos.nombre' },
                    totalVendidos: { $sum: '$platos.cantidad' },
                    ingresos: {
                        $sum: {
                            $multiply: ['$platos.cantidad', '$platos.precio']
                        }
                    }
                }
            },

            { $sort: { totalVendidos: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            message: 'Top 5 platos más vendidos',
            data: resultado
        });

    } catch (error) {
        next(error);
    }
};

export const ingresosPorFecha = async (req, res, next) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({
                success: false,
                message: 'Debe enviar fecha inicio y fin'
            });
        }

        const inicio = new Date(start);
        const fin = new Date(end);

        const resultado = await mongoose.model('Mesa').aggregate([
            {
                $match: {
                    estado: 'CERRADA',
                    createdAt: { $gte: inicio, $lte: fin }
                }
            },
            {
                $group: {
                    _id: null,
                    totalIngresos: { $sum: '$total' },
                    totalMesas: { $sum: 1 },
                    promedioCuenta: { $avg: '$total' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Ingresos por rango de fechas',
            data: resultado[0] || {
                totalIngresos: 0,
                totalMesas: 0,
                promedioCuenta: 0
            }
        });

    } catch (error) {
        next(error);
    }
};

export const horariosOcupacion = async (req, res, next) => {
    try {
        const resultado = await mongoose.model('Mesa').aggregate([
            { $match: { estado: 'CERRADA' } },

            {
                $project: {
                    hora: { $hour: '$createdAt' }
                }
            },
            {
                $group: {
                    _id: '$hora',
                    totalMesas: { $sum: 1 }
                }
            },
            { $sort: { totalMesas: -1 } }
        ]);

        res.status(200).json({
            success: true,
            message: 'Horarios de mayor ocupación',
            data: resultado
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Obtener clientes frecuentes del restaurante
 * Endpoint: GET /reports/clientes-frecuentes
 * Acceso: RESTAURANT_ADMIN, PLATFORM_ADMIN
 */
export const clientesFrecuentes = async (req, res, next) => {
    try {
        const { restaurantID, limit = 10 } = req.query;

        if (!restaurantID) {
            return res.status(400).json({
                success: false,
                message: 'El restaurantID es requerido'
            });
        }

        const resultado = await mongoose.model('Order').aggregate([
            { $match: { restaurantID: new mongoose.Types.ObjectId(restaurantID), estado: 'PAGADO' } },
            {
                $group: {
                    _id: '$clienteNombre',
                    telefono: { $first: '$clienteTelefono' },
                    totalPedidos: { $sum: 1 },
                    totalGastado: { $sum: '$total' },
                    promedioCompra: { $avg: '$total' },
                    ultimoPedido: { $max: '$createdAt' }
                }
            },
            { $sort: { totalPedidos: -1 } },
            { $limit: parseInt(limit) }
        ]);

        res.status(200).json({
            success: true,
            message: 'Clientes frecuentes del restaurante',
            data: resultado
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Obtener estadísticas detalladas de un cliente específico
 * Endpoint: GET /reports/cliente/:nombreCliente
 * Acceso: RESTAURANT_ADMIN, PLATFORM_ADMIN
 */
export const estadisticasCliente = async (req, res, next) => {
    try {
        const { nombreCliente } = req.params;
        const { restaurantID } = req.query;

        if (!restaurantID) {
            return res.status(400).json({
                success: false,
                message: 'El restaurantID es requerido'
            });
        }

        // Obtener estadísticas del cliente
        const estadisticas = await mongoose.model('Order').aggregate([
            {
                $match: {
                    restaurantID: new mongoose.Types.ObjectId(restaurantID),
                    clienteNombre: new RegExp(nombreCliente, 'i'),
                    estado: 'PAGADO'
                }
            },
            {
                $group: {
                    _id: '$clienteNombre',
                    telefono: { $first: '$clienteTelefono' },
                    totalPedidos: { $sum: 1 },
                    totalGastado: { $sum: '$total' },
                    promedioCompra: { $avg: '$total' },
                    minimo: { $min: '$total' },
                    maximo: { $max: '$total' },
                    ultimoPedido: { $max: '$createdAt' },
                    primerPedido: { $min: '$createdAt' }
                }
            }
        ]);

        if (estadisticas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos para este cliente'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Estadísticas detalladas del cliente',
            data: estadisticas[0]
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Obtener plato favorito de un cliente
 * Endpoint: GET /reports/cliente/:nombreCliente/plato-favorito
 * Acceso: RESTAURANT_ADMIN, PLATFORM_ADMIN
 */
export const platoFavoritoCliente = async (req, res, next) => {
    try {
        const { nombreCliente } = req.params;
        const { restaurantID } = req.query;

        if (!restaurantID) {
            return res.status(400).json({
                success: false,
                message: 'El restaurantID es requerido'
            });
        }

        const resultado = await mongoose.model('Order').aggregate([
            {
                $match: {
                    restaurantID: new mongoose.Types.ObjectId(restaurantID),
                    clienteNombre: new RegExp(nombreCliente, 'i'),
                    estado: 'PAGADO'
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.nombre',
                    platoId: { $first: '$items.plato' },
                    veces: { $sum: 1 },
                    totalGastadoEnEste: { $sum: '$items.subtotal' },
                    cantidadTotal: { $sum: '$items.cantidad' }
                }
            },
            { $sort: { veces: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            message: 'Platos favoritos del cliente',
            data: resultado
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Obtener pedidos recurrentes (patrones de compra)
 * Endpoint: GET /reports/pedidos-recurrentes
 * Acceso: RESTAURANT_ADMIN, PLATFORM_ADMIN
 */
export const pedidosRecurrentes = async (req, res, next) => {
    try {
        const { restaurantID, minRepeticiones = 3 } = req.query;

        if (!restaurantID) {
            return res.status(400).json({
                success: false,
                message: 'El restaurantID es requerido'
            });
        }

        // Obtener clientes con múltiples pedidos
        const clientesRecurrentes = await mongoose.model('Order').aggregate([
            {
                $match: {
                    restaurantID: new mongoose.Types.ObjectId(restaurantID),
                    estado: 'PAGADO'
                }
            },
            {
                $group: {
                    _id: '$clienteNombre',
                    totalPedidos: { $sum: 1 },
                    totalGastado: { $sum: '$total' }
                }
            },
            { $match: { totalPedidos: { $gte: parseInt(minRepeticiones) } } },
            { $sort: { totalPedidos: -1 } }
        ]);

        // Para cada cliente, obtener sus platos preferidos
        const pedidosRecurrentes = await Promise.all(
            clientesRecurrentes.map(async (cliente) => {
                const platosFavoritos = await mongoose.model('Order').aggregate([
                    {
                        $match: {
                            restaurantID: new mongoose.Types.ObjectId(restaurantID),
                            clienteNombre: cliente._id,
                            estado: 'PAGADO'
                        }
                    },
                    { $unwind: '$items' },
                    {
                        $group: {
                            _id: '$items.nombre',
                            veces: { $sum: 1 }
                        }
                    },
                    { $sort: { veces: -1 } },
                    { $limit: 3 }
                ]);

                return {
                    cliente: cliente._id,
                    totalPedidos: cliente.totalPedidos,
                    totalGastado: cliente.totalGastado,
                    platosFavoritos: platosFavoritos.map(p => ({ nombre: p._id, veces: p.veces }))
                };
            })
        );

        res.status(200).json({
            success: true,
            message: 'Clientes con pedidos recurrentes',
            data: pedidosRecurrentes
        });

    } catch (error) {
        next(error);
    }
};