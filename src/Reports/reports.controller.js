import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';

const ReportError = class extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
};

const parseDateRange = (query = {}) => {
    const startRaw = query.start || query.desde || query.from;
    const endRaw = query.end || query.hasta || query.to;

    let startDate = null;
    let endDate = null;

    if (startRaw) {
        startDate = new Date(startRaw);
        if (Number.isNaN(startDate.getTime())) {
            throw new ReportError('Fecha inicio inválida');
        }
    }

    if (endRaw) {
        endDate = new Date(endRaw);
        if (Number.isNaN(endDate.getTime())) {
            throw new ReportError('Fecha fin inválida');
        }
    }

    if (startDate && endDate && startDate > endDate) {
        throw new ReportError('La fecha inicio no puede ser mayor que la fecha fin');
    }

    return { startDate, endDate };
};

const buildDateMatch = ({ startDate, endDate }, field = 'createdAt') => {
    if (!startDate && !endDate) return {};

    const range = {};
    if (startDate) range.$gte = startDate;
    if (endDate) range.$lte = endDate;

    return { [field]: range };
};

const parseObjectId = (value, fieldName) => {
    if (!value) return null;
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new ReportError(`${fieldName} inválido`);
    }
    return new mongoose.Types.ObjectId(value);
};

const parsePositiveInt = (value, defaultValue = 10) => {
    const parsed = Number.parseInt(value ?? defaultValue, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return defaultValue;
    return parsed;
};

const formatDate = (date) => {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
};

const formatValue = (value) => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const flattenObjectRows = (value, prefix = '') => {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return [{ campo: prefix || 'valor', valor: '' }];
        }

        return value.flatMap((item, index) => {
            const nextPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
            return flattenObjectRows(item, nextPrefix);
        });
    }

    if (value && typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) {
            return [{ campo: prefix || 'valor', valor: '' }];
        }

        return keys.flatMap((key) => {
            const nextPrefix = prefix ? `${prefix}.${key}` : key;
            return flattenObjectRows(value[key], nextPrefix);
        });
    }

    return [{ campo: prefix || 'valor', valor: formatValue(value) }];
};

const escapeCsvValue = (value) => {
    const normalized = value ?? '';
    const asText = String(normalized);
    if (asText.includes(',') || asText.includes('"') || asText.includes('\n')) {
        return `"${asText.replace(/"/g, '""')}"`;
    }
    return asText;
};

const buildCsvFromData = (data) => {
    const rows = flattenObjectRows(data);
    const header = 'campo,valor';
    const lines = rows.map((row) => `${escapeCsvValue(row.campo)},${escapeCsvValue(row.valor)}`);
    return [header, ...lines].join('\n');
};

const writePdfValue = (doc, key, value, indent = 0) => {
    const left = 50 + indent * 14;

    if (Array.isArray(value)) {
        doc.font('Helvetica-Bold').text(`${key}:`, { indent: left });
        if (value.length === 0) {
            doc.font('Helvetica').text('- Sin datos', { indent: left + 10 });
            return;
        }

        value.forEach((item, index) => {
            if (item && typeof item === 'object') {
                doc.font('Helvetica-Bold').text(`- Item ${index + 1}`, { indent: left + 10 });
                Object.entries(item).forEach(([childKey, childValue]) => {
                    writePdfValue(doc, childKey, childValue, indent + 2);
                });
            } else {
                doc.font('Helvetica').text(`- ${formatValue(item)}`, { indent: left + 10 });
            }
        });

        return;
    }

    if (value && typeof value === 'object') {
        doc.font('Helvetica-Bold').text(`${key}:`, { indent: left });
        Object.entries(value).forEach(([childKey, childValue]) => {
            writePdfValue(doc, childKey, childValue, indent + 1);
        });
        return;
    }

    doc.font('Helvetica').text(`${key}: ${formatValue(value)}`, { indent: left });
};

const sendPDFResponse = (res, filename, title, data) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    doc.pipe(res);

    doc.font('Helvetica-Bold').fontSize(18).text(title, { align: 'center' });
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(10).text(`Generado: ${new Date().toISOString()}`, { align: 'right' });
    doc.moveDown(1);

    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            doc.font('Helvetica-Bold').fontSize(13).text(`Registro ${index + 1}`);
            doc.moveDown(0.3);
            if (item && typeof item === 'object') {
                Object.entries(item).forEach(([key, value]) => writePdfValue(doc, key, value));
            } else {
                doc.font('Helvetica').text(formatValue(item));
            }
            doc.moveDown(0.8);
        });
    } else if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => writePdfValue(doc, key, value));
    } else {
        doc.font('Helvetica').text(formatValue(data));
    }

    doc.end();
};

const sendCsvResponse = (res, filename, data) => {
    const csv = buildCsvFromData(data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(`\uFEFF${csv}`);
};

const resolveRestaurantScope = (query = {}) => {
    const restaurantID = query.restaurantID || query.restauranteID;
    return parseObjectId(restaurantID, 'restaurantID');
};

const buildTopPlatosReport = async (query = {}) => {
    const { startDate, endDate } = parseDateRange(query);
    const restaurantID = resolveRestaurantScope(query);
    const limit = parsePositiveInt(query.limit, 5);

    const match = {
        estado: 'ENTREGADO',
        ...buildDateMatch({ startDate, endDate })
    };

    if (restaurantID) {
        match.restaurantID = restaurantID;
    }

    const data = await mongoose.model('Order').aggregate([
        { $match: match },
        { $unwind: '$items' },
        { $match: { 'items.tipo': 'PLATO' } },
        {
            $group: {
                _id: '$items.plato',
                nombre: { $first: '$items.nombre' },
                totalVendidos: { $sum: '$items.cantidad' },
                totalPedidos: { $sum: 1 },
                ingresos: {
                    $sum: {
                        $multiply: ['$items.cantidad', '$items.precioUnitario']
                    }
                }
            }
        },
        { $sort: { totalVendidos: -1 } },
        { $limit: limit }
    ]);

    return {
        criterio: {
            restaurantID: restaurantID ? restaurantID.toString() : 'TODOS',
            fechaInicio: startDate || null,
            fechaFin: endDate || null,
            limit
        },
        topPlatos: data
    };
};

const buildIngresosReport = async (query = {}) => {
    const { startDate, endDate } = parseDateRange(query);
    const restaurantID = resolveRestaurantScope(query);

    const match = {
        estado: 'ENTREGADO',
        ...buildDateMatch({ startDate, endDate })
    };

    if (restaurantID) {
        match.restaurantID = restaurantID;
    }

    const [summary] = await mongoose.model('Order').aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalIngresos: { $sum: '$total' },
                totalOrdenes: { $sum: 1 },
                promedioCuenta: { $avg: '$total' },
                ticketMinimo: { $min: '$total' },
                ticketMaximo: { $max: '$total' }
            }
        }
    ]);

    const porDia = await mongoose.model('Order').aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    anio: { $year: '$createdAt' },
                    mes: { $month: '$createdAt' },
                    dia: { $dayOfMonth: '$createdAt' }
                },
                totalIngresos: { $sum: '$total' },
                totalOrdenes: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                fecha: {
                    $dateFromParts: {
                        year: '$_id.anio',
                        month: '$_id.mes',
                        day: '$_id.dia'
                    }
                },
                totalIngresos: 1,
                totalOrdenes: 1
            }
        },
        { $sort: { fecha: 1 } }
    ]);

    return {
        criterio: {
            restaurantID: restaurantID ? restaurantID.toString() : 'TODOS',
            fechaInicio: startDate || null,
            fechaFin: endDate || null
        },
        resumen: summary || {
            totalIngresos: 0,
            totalOrdenes: 0,
            promedioCuenta: 0,
            ticketMinimo: 0,
            ticketMaximo: 0
        },
        porDia
    };
};

const buildOcupacionReport = async (query = {}) => {
    const restaurantID = resolveRestaurantScope(query);
    if (!restaurantID) {
        throw new ReportError('El restaurantID es requerido');
    }

    const { startDate, endDate } = parseDateRange(query);
    const fechaHasta = endDate || new Date();
    const fechaDesde = startDate || new Date(fechaHasta.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalMesas = await mongoose.model('Mesa').countDocuments({
        restaurantID,
        isActive: true
    });

    const horarios = await mongoose.model('Order').aggregate([
        {
            $match: {
                restaurantID,
                tipoPedido: 'EN_MESA',
                estado: { $in: ['EN_PREPARACION', 'LISTO', 'ENTREGADO'] },
                createdAt: {
                    $gte: fechaDesde,
                    $lte: fechaHasta
                }
            }
        },
        {
            $project: {
                hora: { $hour: '$createdAt' },
                mesaID: 1
            }
        },
        {
            $group: {
                _id: '$hora',
                totalPedidos: { $sum: 1 },
                mesasOcupadasSet: { $addToSet: '$mesaID' }
            }
        },
        {
            $project: {
                _id: 0,
                hora: '$_id',
                totalPedidos: 1,
                mesasOcupadas: { $size: '$mesasOcupadasSet' }
            }
        },
        { $sort: { hora: 1 } }
    ]);

    const horariosConPorcentaje = horarios.map((row) => ({
        ...row,
        porcentajeOcupacion: totalMesas > 0 ? Number(((row.mesasOcupadas / totalMesas) * 100).toFixed(2)) : 0
    }));

    return {
        criterio: {
            restaurantID: restaurantID.toString(),
            fechaInicio: fechaDesde,
            fechaFin: fechaHasta
        },
        totalMesas,
        horarios: horariosConPorcentaje
    };
};

const buildClientesFrecuentesReport = async (query = {}) => {
    const restaurantID = resolveRestaurantScope(query);
    if (!restaurantID) {
        throw new ReportError('El restaurantID es requerido');
    }

    const limit = parsePositiveInt(query.limit, 10);
    const { startDate, endDate } = parseDateRange(query);

    const match = {
        restaurantID,
        estado: 'ENTREGADO',
        ...buildDateMatch({ startDate, endDate })
    };

    const data = await mongoose.model('Order').aggregate([
        { $match: match },
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
        { $limit: limit }
    ]);

    return {
        criterio: {
            restaurantID: restaurantID.toString(),
            fechaInicio: startDate || null,
            fechaFin: endDate || null,
            limit
        },
        clientes: data
    };
};

const buildEstadisticasClienteReport = async ({ nombreCliente, query = {} }) => {
    if (!nombreCliente) {
        throw new ReportError('El nombreCliente es requerido');
    }

    const restaurantID = resolveRestaurantScope(query);
    if (!restaurantID) {
        throw new ReportError('El restaurantID es requerido');
    }

    const { startDate, endDate } = parseDateRange(query);

    const match = {
        restaurantID,
        clienteNombre: new RegExp(nombreCliente, 'i'),
        estado: 'ENTREGADO',
        ...buildDateMatch({ startDate, endDate })
    };

    const estadisticas = await mongoose.model('Order').aggregate([
        { $match: match },
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
        throw new ReportError('No se encontraron datos para este cliente', 404);
    }

    return {
        criterio: {
            restaurantID: restaurantID.toString(),
            nombreCliente,
            fechaInicio: startDate || null,
            fechaFin: endDate || null
        },
        cliente: estadisticas[0]
    };
};

const buildPlatoFavoritoClienteReport = async ({ nombreCliente, query = {} }) => {
    if (!nombreCliente) {
        throw new ReportError('El nombreCliente es requerido');
    }

    const restaurantID = resolveRestaurantScope(query);
    if (!restaurantID) {
        throw new ReportError('El restaurantID es requerido');
    }

    const { startDate, endDate } = parseDateRange(query);

    const resultado = await mongoose.model('Order').aggregate([
        {
            $match: {
                restaurantID,
                clienteNombre: new RegExp(nombreCliente, 'i'),
                estado: 'ENTREGADO',
                ...buildDateMatch({ startDate, endDate })
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

    return {
        criterio: {
            restaurantID: restaurantID.toString(),
            nombreCliente,
            fechaInicio: startDate || null,
            fechaFin: endDate || null
        },
        platosFavoritos: resultado
    };
};

const buildPedidosRecurrentesReport = async (query = {}) => {
    const restaurantID = resolveRestaurantScope(query);
    if (!restaurantID) {
        throw new ReportError('El restaurantID es requerido');
    }

    const minRepeticiones = parsePositiveInt(query.minRepeticiones, 3);
    const { startDate, endDate } = parseDateRange(query);

    const clientesRecurrentes = await mongoose.model('Order').aggregate([
        {
            $match: {
                restaurantID,
                estado: 'ENTREGADO',
                ...buildDateMatch({ startDate, endDate })
            }
        },
        {
            $group: {
                _id: '$clienteNombre',
                totalPedidos: { $sum: 1 },
                totalGastado: { $sum: '$total' }
            }
        },
        { $match: { totalPedidos: { $gte: minRepeticiones } } },
        { $sort: { totalPedidos: -1 } }
    ]);

    const data = await Promise.all(
        clientesRecurrentes.map(async (cliente) => {
            const platosFavoritos = await mongoose.model('Order').aggregate([
                {
                    $match: {
                        restaurantID,
                        clienteNombre: cliente._id,
                        estado: 'ENTREGADO',
                        ...buildDateMatch({ startDate, endDate })
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
                platosFavoritos: platosFavoritos.map((item) => ({ nombre: item._id, veces: item.veces }))
            };
        })
    );

    return {
        criterio: {
            restaurantID: restaurantID.toString(),
            minRepeticiones,
            fechaInicio: startDate || null,
            fechaFin: endDate || null
        },
        clientes: data
    };
};

const buildDemandaRestaurantesReport = async (query = {}) => {
    const { startDate, endDate } = parseDateRange(query);
    const limit = parsePositiveInt(query.limit, 20);

    const orderMatch = {
        estado: 'ENTREGADO',
        ...buildDateMatch({ startDate, endDate })
    };

    const reservationMatch = {
        isActive: true,
        ...buildDateMatch({ startDate, endDate }, 'fechaReserva')
    };

    const [ordersAgg, reservationsAgg] = await Promise.all([
        mongoose.model('Order').aggregate([
            { $match: orderMatch },
            {
                $group: {
                    _id: '$restaurantID',
                    totalPedidos: { $sum: 1 },
                    ingresos: { $sum: '$total' },
                    ticketPromedio: { $avg: '$total' }
                }
            },
            { $sort: { totalPedidos: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: { path: '$restaurant', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    restaurantID: '$_id',
                    restaurante: '$restaurant.name',
                    categoria: '$restaurant.category',
                    ciudad: '$restaurant.city',
                    totalPedidos: 1,
                    ingresos: 1,
                    ticketPromedio: 1
                }
            }
        ]),
        mongoose.model('Reservation').aggregate([
            { $match: reservationMatch },
            {
                $group: {
                    _id: '$restaurantID',
                    totalReservaciones: { $sum: 1 }
                }
            }
        ])
    ]);

    const reservationsByRestaurant = new Map(
        reservationsAgg.map((item) => [item._id.toString(), item.totalReservaciones])
    );

    const data = ordersAgg.map((row) => {
        const key = row.restaurantID?.toString?.() || '';
        return {
            ...row,
            totalReservaciones: reservationsByRestaurant.get(key) || 0
        };
    });

    return {
        criterio: {
            fechaInicio: startDate || null,
            fechaFin: endDate || null,
            limit
        },
        demandaPorRestaurante: data
    };
};

const buildHorasPicoReport = async (query = {}) => {
    const { startDate, endDate } = parseDateRange(query);
    const restaurantID = resolveRestaurantScope(query);

    const orderMatch = {
        estado: { $in: ['EN_PREPARACION', 'LISTO', 'ENTREGADO'] },
        ...buildDateMatch({ startDate, endDate })
    };

    const reservationMatch = {
        estado: { $in: ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA'] },
        ...buildDateMatch({ startDate, endDate }, 'fechaReserva')
    };

    if (restaurantID) {
        orderMatch.restaurantID = restaurantID;
        reservationMatch.restaurantID = restaurantID;
    }

    const [ordersByHour, reservationsByHour] = await Promise.all([
        mongoose.model('Order').aggregate([
            { $match: orderMatch },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    pedidos: { $sum: 1 }
                }
            }
        ]),
        mongoose.model('Reservation').aggregate([
            { $match: reservationMatch },
            {
                $group: {
                    _id: {
                        $toInt: {
                            $arrayElemAt: [{ $split: ['$horaInicio', ':'] }, 0]
                        }
                    },
                    reservaciones: { $sum: 1 }
                }
            }
        ])
    ]);

    const hoursMap = new Map();

    ordersByHour.forEach((item) => {
        hoursMap.set(item._id, {
            hora: item._id,
            pedidos: item.pedidos,
            reservaciones: 0,
            demandaTotal: item.pedidos
        });
    });

    reservationsByHour.forEach((item) => {
        const existing = hoursMap.get(item._id) || {
            hora: item._id,
            pedidos: 0,
            reservaciones: 0,
            demandaTotal: 0
        };

        existing.reservaciones = item.reservaciones;
        existing.demandaTotal = existing.pedidos + item.reservaciones;
        hoursMap.set(item._id, existing);
    });

    const horarios = [...hoursMap.values()].sort((a, b) => a.hora - b.hora);
    const horaPico = horarios.reduce((prev, current) => (
        !prev || current.demandaTotal > prev.demandaTotal ? current : prev
    ), null);

    return {
        criterio: {
            restaurantID: restaurantID ? restaurantID.toString() : 'TODOS',
            fechaInicio: startDate || null,
            fechaFin: endDate || null
        },
        horaPico,
        horarios
    };
};

const buildReservacionesReport = async (query = {}) => {
    const { startDate, endDate } = parseDateRange(query);
    const restaurantID = resolveRestaurantScope(query);

    const match = {
        isActive: true,
        ...buildDateMatch({ startDate, endDate }, 'fechaReserva')
    };

    if (restaurantID) {
        match.restaurantID = restaurantID;
    }

    const [resumen, porEstado, porDia] = await Promise.all([
        mongoose.model('Reservation').aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalReservaciones: { $sum: 1 },
                    personasTotales: { $sum: '$cantidadPersonas' },
                    promedioPersonasPorReserva: { $avg: '$cantidadPersonas' }
                }
            }
        ]),
        mongoose.model('Reservation').aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$estado',
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]),
        mongoose.model('Reservation').aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        anio: { $year: '$fechaReserva' },
                        mes: { $month: '$fechaReserva' },
                        dia: { $dayOfMonth: '$fechaReserva' }
                    },
                    total: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    fecha: {
                        $dateFromParts: {
                            year: '$_id.anio',
                            month: '$_id.mes',
                            day: '$_id.dia'
                        }
                    },
                    total: 1
                }
            },
            { $sort: { fecha: 1 } }
        ])
    ]);

    return {
        criterio: {
            restaurantID: restaurantID ? restaurantID.toString() : 'TODOS',
            fechaInicio: startDate || null,
            fechaFin: endDate || null
        },
        resumen: resumen[0] || {
            totalReservaciones: 0,
            personasTotales: 0,
            promedioPersonasPorReserva: 0
        },
        porEstado,
        porDia
    };
};

const buildDesempenoRestauranteReport = async (query = {}) => {
    const restaurantID = resolveRestaurantScope(query);
    if (!restaurantID) {
        throw new ReportError('El restaurantID es requerido');
    }

    const { startDate, endDate } = parseDateRange(query);
    const orderDateMatch = buildDateMatch({ startDate, endDate });
    const reservationDateMatch = buildDateMatch({ startDate, endDate }, 'fechaReserva');
    const reviewDateMatch = buildDateMatch({ startDate, endDate });

    const [restaurant, totalMesas, resumenPedidosAgg, pedidosPorDia, ocupacionPorHora, reservacionesAgg, satisfaccionAgg, distribucionCalificacion] = await Promise.all([
        mongoose.model('Restaurant').findById(restaurantID).select('name category city'),
        mongoose.model('Mesa').countDocuments({ restaurantID, isActive: true }),
        mongoose.model('Order').aggregate([
            {
                $match: {
                    restaurantID,
                    estado: 'ENTREGADO',
                    ...orderDateMatch
                }
            },
            {
                $group: {
                    _id: null,
                    totalIngresos: { $sum: '$total' },
                    totalPedidos: { $sum: 1 },
                    promedioTicket: { $avg: '$total' }
                }
            }
        ]),
        mongoose.model('Order').aggregate([
            {
                $match: {
                    restaurantID,
                    estado: 'ENTREGADO',
                    ...orderDateMatch
                }
            },
            {
                $group: {
                    _id: {
                        anio: { $year: '$createdAt' },
                        mes: { $month: '$createdAt' },
                        dia: { $dayOfMonth: '$createdAt' }
                    },
                    totalPedidos: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    fecha: {
                        $dateFromParts: {
                            year: '$_id.anio',
                            month: '$_id.mes',
                            day: '$_id.dia'
                        }
                    },
                    totalPedidos: 1
                }
            },
            { $sort: { fecha: 1 } }
        ]),
        mongoose.model('Order').aggregate([
            {
                $match: {
                    restaurantID,
                    tipoPedido: 'EN_MESA',
                    estado: { $in: ['EN_PREPARACION', 'LISTO', 'ENTREGADO'] },
                    ...orderDateMatch
                }
            },
            {
                $project: {
                    hora: { $hour: '$createdAt' },
                    mesaID: 1
                }
            },
            {
                $group: {
                    _id: '$hora',
                    mesasOcupadasSet: { $addToSet: '$mesaID' }
                }
            },
            {
                $project: {
                    _id: 0,
                    hora: '$_id',
                    mesasOcupadas: { $size: '$mesasOcupadasSet' }
                }
            },
            { $sort: { hora: 1 } }
        ]),
        mongoose.model('Reservation').aggregate([
            {
                $match: {
                    restaurantID,
                    ...reservationDateMatch
                }
            },
            {
                $group: {
                    _id: '$estado',
                    total: { $sum: 1 }
                }
            }
        ]),
        mongoose.model('Review').aggregate([
            {
                $match: {
                    restaurantID,
                    isActive: true,
                    ...reviewDateMatch
                }
            },
            {
                $group: {
                    _id: null,
                    totalResenas: { $sum: 1 },
                    promedioCalificacion: { $avg: '$rating' }
                }
            }
        ]),
        mongoose.model('Review').aggregate([
            {
                $match: {
                    restaurantID,
                    isActive: true,
                    ...reviewDateMatch
                }
            },
            {
                $group: {
                    _id: '$rating',
                    total: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])
    ]);

    const resumenPedidos = resumenPedidosAgg[0] || {
        totalIngresos: 0,
        totalPedidos: 0,
        promedioTicket: 0
    };

    const ocupacionConPorcentaje = ocupacionPorHora.map((row) => ({
        ...row,
        porcentajeOcupacion: totalMesas > 0 ? Number(((row.mesasOcupadas / totalMesas) * 100).toFixed(2)) : 0
    }));

    const ocupacionPromedio = ocupacionConPorcentaje.length > 0
        ? Number((ocupacionConPorcentaje.reduce((acc, row) => acc + row.porcentajeOcupacion, 0) / ocupacionConPorcentaje.length).toFixed(2))
        : 0;

    const reservacionesPorEstado = reservacionesAgg.reduce((acc, row) => {
        acc[row._id] = row.total;
        return acc;
    }, {});

    return {
        criterio: {
            restaurantID: restaurantID.toString(),
            fechaInicio: startDate || null,
            fechaFin: endDate || null
        },
        restaurante: {
            id: restaurantID.toString(),
            nombre: restaurant?.name || 'No disponible',
            categoria: restaurant?.category || 'No disponible',
            ciudad: restaurant?.city || 'No disponible'
        },
        desempeno: {
            ingresos: resumenPedidos.totalIngresos,
            pedidosTotales: resumenPedidos.totalPedidos,
            promedioTicket: resumenPedidos.promedioTicket,
            pedidosPorDia,
            totalMesas,
            ocupacionPromedio,
            ocupacionPorHora: ocupacionConPorcentaje,
            reservaciones: {
                total: Object.values(reservacionesPorEstado).reduce((acc, value) => acc + value, 0),
                porEstado: reservacionesPorEstado
            },
            satisfaccion: {
                totalResenas: satisfaccionAgg[0]?.totalResenas || 0,
                promedioCalificacion: satisfaccionAgg[0]?.promedioCalificacion || 0,
                distribucion: distribucionCalificacion.map((row) => ({
                    rating: row._id,
                    total: row.total
                }))
            }
        }
    };
};

const reportBuilders = {
    'top-platos': async ({ query }) => buildTopPlatosReport(query),
    'ingresos': async ({ query }) => buildIngresosReport(query),
    'ocupacion': async ({ query }) => buildOcupacionReport(query),
    'clientes-frecuentes': async ({ query }) => buildClientesFrecuentesReport(query),
    'pedidos-recurrentes': async ({ query }) => buildPedidosRecurrentesReport(query),
    'demanda-restaurantes': async ({ query }) => buildDemandaRestaurantesReport(query),
    'horas-pico': async ({ query }) => buildHorasPicoReport(query),
    'reservaciones': async ({ query }) => buildReservacionesReport(query),
    'desempeno-restaurante': async ({ query }) => buildDesempenoRestauranteReport(query)
};

const getReportBuilder = (tipo) => reportBuilders[tipo];

const executeAndRespond = async (res, title, builder) => {
    const data = await builder();
    return res.status(200).json({
        success: true,
        message: title,
        data
    });
};

const handleControllerError = (error, next) => {
    if (error instanceof ReportError) {
        return next({ statusCode: error.statusCode, message: error.message });
    }
    return next(error);
};

export const exportarReportePDF = async (req, res, next) => {
    try {
        const { reporteId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(reporteId)) {
            return res.status(400).json({ success: false, message: 'reporteId inválido' });
        }

        const order = await mongoose.model('Order').findById(reporteId).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        sendPDFResponse(
            res,
            `reporte_pedido_${reporteId}.pdf`,
            'Reporte de Pedido',
            {
                numeroOrden: order.numeroOrden,
                tipoPedido: order.tipoPedido,
                estado: order.estado,
                clienteNombre: order.clienteNombre,
                clienteTelefono: order.clienteTelefono,
                total: order.total,
                fechaCreacion: order.createdAt,
                items: order.items || []
            }
        );
    } catch (error) {
        next(error);
    }
};

export const exportarTodosReportesPDF = async (req, res, next) => {
    try {
        const baseReports = ['demanda-restaurantes', 'top-platos', 'ingresos', 'horas-pico', 'reservaciones'];
        const withRestaurant = req.query.restaurantID
            ? [...baseReports, 'ocupacion', 'desempeno-restaurante', 'clientes-frecuentes', 'pedidos-recurrentes']
            : baseReports;

        const reportsData = [];

        for (const tipo of withRestaurant) {
            const builder = getReportBuilder(tipo);
            if (!builder) continue;

            try {
                const data = await builder({ query: req.query, params: req.params });
                reportsData.push({ tipo, data });
            } catch (error) {
                reportsData.push({ tipo, data: { error: error.message } });
            }
        }

        sendPDFResponse(res, 'reportes_todos.pdf', 'Reporte Consolidado GastroFlow', { reportes: reportsData });
    } catch (error) {
        next(error);
    }
};

export const exportarReportePorTipo = async (req, res, next) => {
    try {
        const { tipo, formato } = req.params;
        const builder = getReportBuilder(tipo);

        if (!builder) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de reporte no soportado'
            });
        }

        const data = await builder({ query: req.query, params: req.params });
        const fecha = formatDate(new Date()) || 'reporte';

        if (formato === 'pdf') {
            sendPDFResponse(res, `reporte_${tipo}_${fecha}.pdf`, `Reporte: ${tipo}`, data);
            return;
        }

        if (formato === 'excel') {
            sendCsvResponse(res, `reporte_${tipo}_${fecha}.csv`, data);
            return;
        }

        return res.status(400).json({ success: false, message: 'Formato no soportado. Use pdf o excel' });
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const topPlatos = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Top de platos más vendidos', () => buildTopPlatosReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const ingresosPorFecha = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Ingresos por rango de fechas', () => buildIngresosReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const horariosOcupacion = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Horarios de ocupación de mesas', () => buildOcupacionReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const clientesFrecuentes = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Clientes frecuentes del restaurante', () => buildClientesFrecuentesReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const estadisticasCliente = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Estadísticas detalladas del cliente', () =>
            buildEstadisticasClienteReport({
                nombreCliente: req.params.nombreCliente,
                query: req.query
            })
        );
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const platoFavoritoCliente = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Platos favoritos del cliente', () =>
            buildPlatoFavoritoClienteReport({
                nombreCliente: req.params.nombreCliente,
                query: req.query
            })
        );
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const pedidosRecurrentes = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Clientes con pedidos recurrentes', () => buildPedidosRecurrentesReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const demandaRestaurantes = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Demanda por restaurante', () => buildDemandaRestaurantesReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const horasPico = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Horas pico de demanda', () => buildHorasPicoReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const reporteReservaciones = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Reporte de reservaciones', () => buildReservacionesReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};

export const desempenoRestaurante = async (req, res, next) => {
    try {
        await executeAndRespond(res, 'Desempeño detallado del restaurante', () => buildDesempenoRestauranteReport(req.query));
    } catch (error) {
        handleControllerError(error, next);
    }
};
