import Reservation from './reservation.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import Mesa from '../Mesas/mesa.model.js';
import { notifyNewReservation, notifyReservationStatusChange } from '../../configs/socket.js';
import { enviarEmailAlertaTiempoReal, enviarEmailReservacionPendiente, enviarEmailReservacionAprobada, enviarEmailReservacionRechazada } from '../../helper/email-service.js';

const isClientRole = (req) => req.usuario?.role === 'CLIENT';
const isRestaurantAdminRole = (req) => req.usuario?.role === 'RESTAURANT_ADMIN';
const isPlatformAdminRole = (req) => req.usuario?.role === 'PLATFORM_ADMIN';

const getManagedRestaurantIds = async (adminUserId) => {
    // Buscar restaurantes gestionados por el admin. Intentamos varios campos
    // por compatibilidad con datos existentes: `adminId`, `admin_user_id`,
    // o por email (adminEmail/admin_email) si el admin fue referenciado por email.
    const orConditions = [
        { adminId: adminUserId },
        { admin_user_id: adminUserId },
    ];

    // Si el adminUserId parece un email, buscar por campos de email también
    if (typeof adminUserId === 'string' && adminUserId.includes('@')) {
        orConditions.push({ adminEmail: adminUserId }, { admin_email: adminUserId });
    }

    // Además, si el JWT trae el email en req.usuario.email, el llamador puede
    // convertir y pasar ese email a esta función si lo desea. Aquí esperamos
    // que el llamador pase el id principal; la comprobación por email es una
    // ayuda extra cuando el id no coincide entre servicios.

    const restaurants = await Restaurant.find({
        $or: orConditions,
        isActive: true,
    }).select('_id');

    return restaurants.map((restaurant) => restaurant._id.toString());
};

const canAccessReservation = async (req, reservation) => {
    if (!reservation) return false;

    if (isPlatformAdminRole(req)) return true;

    if (isClientRole(req)) {
        return reservation.clienteId === req.usuario.sub;
    }

    if (isRestaurantAdminRole(req)) {
        const managedRestaurantIds = await getManagedRestaurantIds(req.usuario.sub);

        // Normalizar reservation.restaurantID para comparar cuando esté poblado
        let reservationRestaurantId = null;
        try {
            if (!reservation.restaurantID) {
                reservationRestaurantId = null;
            } else if (typeof reservation.restaurantID === 'string') {
                reservationRestaurantId = reservation.restaurantID;
            } else if (reservation.restaurantID._id) {
                reservationRestaurantId = reservation.restaurantID._id.toString();
            } else if (reservation.restaurantID.toString) {
                reservationRestaurantId = reservation.restaurantID.toString();
            }
        } catch (e) {
            reservationRestaurantId = String(reservation.restaurantID);
        }

        console.info(`canAccessReservation: user=${req.usuario?.sub} role=${req.usuario?.role} managed=${JSON.stringify(managedRestaurantIds)} reservation.restaurantID=${reservationRestaurantId}`);

        if (!reservationRestaurantId) return false;

        // Fallback: si el JWT contiene un restaurantId asignado al usuario,
        // permitir acceso cuando coincide con la reserva (caso común en frontend).
        try {
            const userRestaurantCandidates = [];
            const u = req.usuario || {};
            if (u.restaurantId) {
                if (typeof u.restaurantId === 'string') userRestaurantCandidates.push(u.restaurantId);
                else if (u.restaurantId._id) userRestaurantCandidates.push(u.restaurantId._id.toString());
                else if (u.restaurantId.id) userRestaurantCandidates.push(String(u.restaurantId.id));
            }
            if (u.RestaurantId) {
                if (typeof u.RestaurantId === 'string') userRestaurantCandidates.push(u.RestaurantId);
                else if (u.RestaurantId._id) userRestaurantCandidates.push(u.RestaurantId._id.toString());
                else if (u.RestaurantId.id) userRestaurantCandidates.push(String(u.RestaurantId.id));
            }

            const matchedByUserRestaurant = userRestaurantCandidates.some((c) => c && c === reservationRestaurantId);
            if (matchedByUserRestaurant) {
                console.info(`canAccessReservation: permiso concedido por restaurantId en JWT para user=${req.usuario?.sub}`);
                return true;
            }
        } catch (e) {
            // fallthrough
        }

        return managedRestaurantIds.includes(reservationRestaurantId);
    }

    return false;
};

const populateReservation = (query) => {
    return query
        .populate('restaurantID', 'name city address phone')
        .populate('mesaID', 'numero capacidad ubicacion');
};

const validateRestaurantAndMesa = async (restaurantID, mesaID) => {
    const restaurant = await Restaurant.findById(restaurantID);
    if (!restaurant || !restaurant.isActive) {
        const error = new Error('Restaurante no encontrado o inactivo');
        error.status = 404;
        throw error;
    }

    const mesa = await Mesa.findById(mesaID);
    if (!mesa || !mesa.isActive) {
        const error = new Error('Mesa no encontrada o inactiva');
        error.status = 404;
        throw error;
    }

    if (mesa.restaurantID.toString() !== restaurantID) {
        const error = new Error('La mesa no pertenece al restaurante indicado');
        error.status = 400;
        throw error;
    }
};

const parseDateTime = (fechaReserva, hora) => {
    const reservationDate = new Date(fechaReserva);
    const [hours, minutes] = String(hora).split(':').map(Number);

    const dateTime = new Date(reservationDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
};

const hasReservationConflict = async ({ mesaID, fechaReserva, horaInicio, horaFin, excludeId }) => {
    const reservationDate = new Date(fechaReserva);
    const dateStart = new Date(reservationDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(reservationDate);
    dateEnd.setHours(23, 59, 59, 999);

    const filter = {
        mesaID,
        fechaReserva: { $gte: dateStart, $lte: dateEnd },
        isActive: true,
        estado: { $in: ['PENDIENTE', 'CONFIRMADA'] },
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    const conflictingReservations = await Reservation.find(filter);
    const requestedStart = parseDateTime(fechaReserva, horaInicio);
    const requestedEnd = parseDateTime(fechaReserva, horaFin);

    for (const reservation of conflictingReservations) {
        const existingStart = parseDateTime(reservation.fechaReserva, reservation.horaInicio);
        const existingEnd = parseDateTime(reservation.fechaReserva, reservation.horaFin);

        const hasTimeOverlap = requestedStart < existingEnd && requestedEnd > existingStart;

        if (hasTimeOverlap) {
            return {
                conflict: true,
                reservation,
            };
        }
    }

    return { conflict: false, reservation: null };
};

const checkRestaurantCapacity = async (restaurantID, cantidadPersonas, fechaReserva, excludeId = null) => {
    const restaurant = await Restaurant.findById(restaurantID);
    if (!restaurant) return false;

    const reservationDate = new Date(fechaReserva);
    const dateStart = new Date(reservationDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(reservationDate);
    dateEnd.setHours(23, 59, 59, 999);

    const filter = {
        restaurantID,
        fechaReserva: { $gte: dateStart, $lte: dateEnd },
        isActive: true,
        estado: { $in: ['PENDIENTE', 'CONFIRMADA'] },
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    const reservations = await Reservation.find(filter);
    const totalPersonas = reservations.reduce((sum, res) => sum + res.cantidadPersonas, 0);
    const availableCapacity = restaurant.aforoMaximo - totalPersonas;

    return { available: availableCapacity >= cantidadPersonas, availableCapacity, aforoMaximo: restaurant.aforoMaximo };
};

const hasMesaAvailabilityConflict = async ({ mesaID, fechaReserva, horaInicio, horaFin }) => {
    const conflict = await hasReservationConflict({ mesaID, fechaReserva, horaInicio, horaFin });
    return conflict.conflict;
};

export const getAvailableTables = async (req, res) => {
    try {
        const { restaurantID, restaurantId, date, timeStart, timeEnd } = req.query;
        const effectiveRestaurantID = restaurantID || restaurantId;

        if (!effectiveRestaurantID || !date || !timeStart || !timeEnd) {
            return res.status(400).json({
                success: false,
                message: 'restaurantID, date, timeStart y timeEnd son requeridos',
            });
        }
        // Si el usuario es admin de restaurante, validar que el restaurantID solicitado
        // pertenezca a alguno de los restaurantes que gestiona.
        if (isRestaurantAdminRole(req)) {
            const managedIds = await getManagedRestaurantIds(req.usuario.sub);
            if (!managedIds.includes(effectiveRestaurantID)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para ver mesas de este restaurante',
                });
            }
        }
        const restaurant = await Restaurant.findById(effectiveRestaurantID);
        if (!restaurant || !restaurant.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado o inactivo',
            });
        }

        const mesas = await Mesa.find({
            restaurantID: effectiveRestaurantID,
            isActive: true,
        }).sort({ numero: 1 });

        const availableTables = [];

        for (const mesa of mesas) {
            const conflict = await hasMesaAvailabilityConflict({
                mesaID: mesa._id,
                fechaReserva: date,
                horaInicio: timeStart,
                horaFin: timeEnd,
            });

            if (!conflict) {
                availableTables.push(mesa);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Mesas disponibles obtenidas exitosamente',
            data: availableTables,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: 'Error al obtener mesas disponibles',
            error: error.message,
        });
    }
};

export const createReservation = async (req, res) => {
    try {
        const { restaurantID, mesaID, fechaReserva, horaInicio, horaFin, cantidadPersonas, notas } = req.body;

        if (!horaInicio || !horaFin) {
            return res.status(400).json({
                success: false,
                message: 'Las horas de inicio y fin son requeridas (formato HH:mm)',
            });
        }

        const requesterId = req.usuario?.sub;
        if (!requesterId) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido: no se pudo identificar al usuario',
            });
        }

        // El email del requester viene del token JWT en req.usuario
        const requesterEmail = req.usuario?.email?.toLowerCase()?.trim();
        
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🔐 DEBUG: Contenido del JWT (req.usuario)`);
        console.log(`${'='.repeat(70)}`);
        console.log(`req.usuario:`, JSON.stringify(req.usuario, null, 2));
        console.log(`email extraído:`, requesterEmail);
        console.log(`${'='.repeat(70)}\n`);

        const clienteId = isClientRole(req) ? requesterId : (req.body.clienteId || requesterId);
        // En MongoDB, asumimos que el cliente es válido si tiene un ID
        // La validación del estado del usuario se realiza en el middleware de autenticación

        await validateRestaurantAndMesa(restaurantID, mesaID);

        // Validar que cantidadPersonas no exceda la capacidad de la mesa
        const mesa = await Mesa.findById(mesaID);
        if (cantidadPersonas > mesa.capacidad) {
            return res.status(400).json({
                success: false,
                message: `La cantidad de personas (${cantidadPersonas}) excede la capacidad de la mesa (${mesa.capacidad})`,
            });
        }

        // Validar conflicto de reserva en tiempo real con rangos horarios
        const conflict = await hasReservationConflict({ 
            mesaID, 
            fechaReserva, 
            horaInicio, 
            horaFin 
        });
        if (conflict.conflict) {
            return res.status(409).json({
                success: false,
                message: `La mesa ya está reservada hasta las ${conflict.reservation?.horaFin || 'hora no disponible'}. Selecciona otro horario.`,
                data: {
                    mesaID,
                    reservationId: conflict.reservation?._id || null,
                    horaInicioOcupada: conflict.reservation?.horaInicio || null,
                    horaFinOcupada: conflict.reservation?.horaFin || null,
                },
            });
        }

        // Validar que no se exceda el aforo máximo del restaurante
        const capacityCheck = await checkRestaurantCapacity(restaurantID, cantidadPersonas, fechaReserva);
        if (!capacityCheck.available) {
            return res.status(409).json({
                success: false,
                message: `Capacidad insuficiente. Aforo disponible: ${capacityCheck.availableCapacity}/${capacityCheck.aforoMaximo}`,
            });
        }

        const reservation = new Reservation({
            restaurantID,
            mesaID,
            clienteId,
            clienteNombre: req.body.clienteNombre || req.usuario?.name || 'Cliente',
            clienteTelefono: req.body.clienteTelefono || req.usuario?.phone || '',
            clienteEmail: req.body.clienteEmail || req.usuario?.email || '',
            fechaReserva: new Date(fechaReserva),
            horaInicio,
            horaFin,
            cantidadPersonas,
            notas,
            estado: 'PENDIENTE',
        });

        await reservation.save();
        await reservation.populate([
            { path: 'restaurantID', select: 'name city address phone aforoMaximo' },
            { path: 'mesaID', select: 'numero capacidad ubicacion' },
        ]);

        // Notificar al admin del restaurante sobre nueva reserva
        notifyNewReservation(restaurantID, {
            _id: reservation._id,
            clienteNombre: reservation.clienteNombre,
            fechaReserva: reservation.fechaReserva,
            horaInicio: reservation.horaInicio,
            horaFin: reservation.horaFin,
            cantidadPersonas: reservation.cantidadPersonas,
            mesa: reservation.mesaID,
            estado: reservation.estado
        });

        // Enviar email al cliente notificando que su reservación está pendiente de aprobación
        if (requesterEmail) {
            const fechaFormato = new Date(reservation.fechaReserva).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            
            console.log(`\n${'='.repeat(70)}`);
            console.log(`📧 EMAIL DE RESERVACIÓN PENDIENTE`);
            console.log(`${'='.repeat(70)}`);
            console.log(`📤 Destinatario: ${requesterEmail}`);
            console.log(`👤 Cliente: ${reservation.clienteNombre}`);
            console.log(`🏢 Restaurante: ${reservation.restaurantID?.name}`);
            console.log(`${'='.repeat(70)}\n`);
            
            try {
                await enviarEmailReservacionPendiente({
                    email: requesterEmail,
                    nombre: reservation.clienteNombre,
                    restaurante: reservation.restaurantID?.name || 'Restaurante',
                    fecha: fechaFormato,
                    hora: `${reservation.horaInicio} - ${reservation.horaFin}`,
                    personas: reservation.cantidadPersonas,
                    mesaNumero: reservation.mesaID?.numero || 'Por asignar'
                });
                console.log(`✅ Email de reservación pendiente enviado exitosamente a ${requesterEmail}`);
            } catch (emailError) {
                console.error(`❌ Error al enviar email de reservación pendiente a ${requesterEmail}:`, emailError.message);
            }
        } else {
            console.warn('⚠️  No se encontró email del usuario para enviar notificación de reservación pendiente');
        }

        res.status(201).json({
            success: true,
            message: 'Reservación registrada exitosamente. Tu reservación está siendo observada por un administrador. Recibirás un email de confirmación cuando sea aprobada.',
            data: {
                ...reservation.toObject(),
                estado: 'PENDIENTE',
                proximosPasos: 'Un administrador del restaurante revisará tu solicitud. Tiempo estimado: 15 minutos a 2 horas. Recibirás un email cuando sea confirmada.'
            },
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: 'Error al crear reservación',
            error: error.message,
        });
    }
};

export const getReservations = async (req, res) => {
    try {
        const {
            restaurantID,
            mesaID,
            estado,
            from,
            to,
            page = 1,
            limit = 10,
        } = req.query;

        const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
        const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);

        const filter = {};

        if (estado) filter.estado = estado;

        if (from || to) {
            filter.fechaReserva = {};
            if (from) filter.fechaReserva.$gte = new Date(from);
            if (to) filter.fechaReserva.$lte = new Date(to);
        }

        if (isClientRole(req)) {
            filter.clienteId = req.usuario.sub;
            if (restaurantID) filter.restaurantID = restaurantID;
            if (mesaID) filter.mesaID = mesaID;
        } else if (isRestaurantAdminRole(req)) {
            filter.isActive = true;
            const managedRestaurantIds = await getManagedRestaurantIds(req.usuario.sub);

            // Si el admin gestiona restaurantes, limitar por esos restaurantes.
            // Si no gestiona ninguno, permitimos ver las reservaciones generales.
            if (managedRestaurantIds && managedRestaurantIds.length > 0) {
                if (restaurantID) {
                    if (!managedRestaurantIds.includes(restaurantID)) {
                        return res.status(403).json({
                            success: false,
                            message: 'No tienes permiso para ver reservaciones de este restaurante',
                        });
                    }

                    filter.restaurantID = restaurantID;
                } else {
                    filter.restaurantID = { $in: managedRestaurantIds };
                }

                if (mesaID) filter.mesaID = mesaID;

                // Si se especifica una mesa, verificar que la mesa pertenezca a un restaurante
                // gestionado por el admin solicitante
                if (mesaID) {
                    const mesa = await Mesa.findById(mesaID).select('restaurantID isActive');
                    if (!mesa || !mesa.isActive) {
                        return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
                    }

                    if (!managedRestaurantIds.includes(mesa.restaurantID.toString())) {
                        return res.status(403).json({ success: false, message: 'No tienes permiso para ver reservaciones de esta mesa' });
                    }
                }
            } else {
                // No gestiona restaurantes: el admin restaurante verá reservaciones generales.
                if (restaurantID) filter.restaurantID = restaurantID;
                if (mesaID) filter.mesaID = mesaID;
            }
        } else if (isPlatformAdminRole(req)) {
            filter.isActive = true;
            if (restaurantID) filter.restaurantID = restaurantID;
            if (mesaID) filter.mesaID = mesaID;
            if (req.query.clienteId) filter.clienteId = req.query.clienteId;
        } else {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver reservaciones',
            });
        }

        const [reservations, total] = await Promise.all([
            populateReservation(
                Reservation.find(filter)
                    .sort({ fechaReserva: 1, createdAt: -1 })
                    .limit(parsedLimit)
                    .skip((parsedPage - 1) * parsedLimit)
            ),
            Reservation.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            message: 'Reservaciones obtenidas exitosamente',
            data: reservations,
            pagination: {
                total,
                pages: Math.ceil(total / parsedLimit),
                currentPage: parsedPage,
                limit: parsedLimit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reservaciones',
            error: error.message,
        });
    }
};

export const getReservationById = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await populateReservation(Reservation.findById(id));

        if (!reservation || !reservation.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada',
            });
        }

        if (!(await canAccessReservation(req, reservation))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver esta reservación',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reservación obtenida exitosamente',
            data: reservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reservación',
            error: error.message,
        });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const reservation = await Reservation.findById(id);

        if (!reservation || !reservation.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada',
            });
        }

        if (!(await canAccessReservation(req, reservation))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para actualizar esta reservación',
            });
        }

        if (isClientRole(req)) {
            delete updateData.estado;
            delete updateData.clienteId;
            delete updateData.clienteNombre;
            delete updateData.clienteTelefono;
        }

        const restaurantID = updateData.restaurantID || reservation.restaurantID.toString();
        const mesaID = updateData.mesaID || reservation.mesaID.toString();
        const fechaReserva = updateData.fechaReserva || reservation.fechaReserva;
        const horaInicio = updateData.horaInicio || reservation.horaInicio;
        const horaFin = updateData.horaFin || reservation.horaFin;
        const cantidadPersonas = updateData.cantidadPersonas || reservation.cantidadPersonas;

        if (updateData.restaurantID || updateData.mesaID) {
            await validateRestaurantAndMesa(restaurantID, mesaID);
        }

        // Validar capacidad de mesa si se cambia la cantidad de personas
        if (updateData.cantidadPersonas) {
            const mesa = await Mesa.findById(mesaID);
            if (updateData.cantidadPersonas > mesa.capacidad) {
                return res.status(400).json({
                    success: false,
                    message: `La cantidad de personas (${updateData.cantidadPersonas}) excede la capacidad de la mesa (${mesa.capacidad})`,
                });
            }
        }

        if (updateData.mesaID || updateData.fechaReserva || updateData.horaInicio || updateData.horaFin) {
            const conflict = await hasReservationConflict({
                mesaID,
                fechaReserva,
                horaInicio,
                horaFin,
                excludeId: reservation._id,
            });

            if (conflict.conflict) {
                return res.status(409).json({
                    success: false,
                    message: `La mesa ya está reservada hasta las ${conflict.reservation?.horaFin || 'hora no disponible'}. Selecciona otro horario.`,
                    data: {
                        mesaID,
                        reservationId: conflict.reservation?._id || null,
                        horaInicioOcupada: conflict.reservation?.horaInicio || null,
                        horaFinOcupada: conflict.reservation?.horaFin || null,
                    },
                });
            }
        }

        // Validar aforo máximo del restaurante si se cambia cantidad o fecha
        if (updateData.cantidadPersonas || updateData.fechaReserva) {
            const capacityCheck = await checkRestaurantCapacity(
                restaurantID, 
                cantidadPersonas, 
                fechaReserva,
                reservation._id
            );
            if (!capacityCheck.available) {
                return res.status(409).json({
                    success: false,
                    message: `Capacidad insuficiente. Aforo disponible: ${capacityCheck.availableCapacity}/${capacityCheck.aforoMaximo}`,
                });
            }
        }

        const updatedReservation = await populateReservation(
            Reservation.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            })
        );

        // Notificar al cliente si el estado cambió
        if (updateData.estado && updateData.estado !== reservation.estado) {
            notifyReservationStatusChange(reservation.clienteId, {
                _id: updatedReservation._id,
                estado: updatedReservation.estado,
                fechaReserva: updatedReservation.fechaReserva,
                horaInicio: updatedReservation.horaInicio,
                horaFin: updatedReservation.horaFin,
                restaurante: updatedReservation.restaurantID,
                mesa: updatedReservation.mesaID
            });

            const requesterId = req.usuario?.sub;
            // El email del requester viene del token JWT
            const requesterEmail = req.usuario?.email?.toLowerCase()?.trim();

            if (requesterEmail) {
                await enviarEmailAlertaTiempoReal({
                    to: requesterEmail,
                    asunto: 'Alerta Tiempo Real: Cambio de estado de reservación',
                    titulo: 'Cambio de estado emitido por socket',
                    mensaje: 'Se emitió el evento cambio-estado-reserva para validar notificaciones en tiempo real.',
                    detalles: [
                        { label: 'Reserva ID', value: updatedReservation._id?.toString() },
                        { label: 'Cliente ID', value: reservation.clienteId },
                        { label: 'Estado anterior', value: reservation.estado },
                        { label: 'Estado nuevo', value: updatedReservation.estado },
                        { label: 'Fecha', value: updatedReservation.fechaReserva?.toISOString?.() || updatedReservation.fechaReserva },
                        { label: 'Hora', value: `${updatedReservation.horaInicio} - ${updatedReservation.horaFin}` },
                    ],
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Reservación actualizada exitosamente',
            data: updatedReservation,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: 'Error al actualizar reservación',
            error: error.message,
        });
    }
};

export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findById(id);

        if (!reservation || !reservation.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada',
            });
        }

        if (!(await canAccessReservation(req, reservation))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta reservación',
            });
        }

        reservation.isActive = false;
        reservation.estado = 'CANCELADA';
        await reservation.save();

        res.status(200).json({
            success: true,
            message: 'Reservación eliminada exitosamente',
            data: reservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar reservación',
            error: error.message,
        });
    }
};

export const approveOrRejectReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { accion, razon } = req.body; // accion: 'APROBAR' o 'RECHAZAR'

        // Validar que sea admin del restaurante o admin de plataforma
        if (!isRestaurantAdminRole(req) && !isPlatformAdminRole(req)) {
            return res.status(403).json({
                success: false,
                message: 'Solo administradores pueden aprobar o rechazar reservaciones',
            });
        }

        if (!accion || !['APROBAR', 'RECHAZAR'].includes(accion.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Acción inválida. Debe ser APROBAR o RECHAZAR',
            });
        }

        const reservation = await Reservation.findById(id);

        if (!reservation || !reservation.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada',
            });
        }

        // Permitir que administradores (plataforma o restaurante) gestionen reservaciones.
        // Para otros roles (si llegan aquí) comprobamos con canAccessReservation.
        if (!isPlatformAdminRole(req) && !isRestaurantAdminRole(req)) {
            if (!(await canAccessReservation(req, reservation))) {
                console.warn(`Usuario ${req.usuario?.sub || 'unknown'} rol=${req.usuario?.role} no tiene permiso para gestionar reservación ${id}`);
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para gestionar esta reservación',
                });
            }
        }

        // Solo se pueden aprobar/rechazar reservaciones PENDIENTES
        if (reservation.estado !== 'PENDIENTE') {
            return res.status(400).json({
                success: false,
                message: `No se puede ${accion.toLowerCase()} una reservación con estado ${reservation.estado}`,
            });
        }

        const nuevoEstado = accion.toUpperCase() === 'APROBAR' ? 'CONFIRMADA' : 'CANCELADA';
        reservation.estado = nuevoEstado;
        await reservation.save();

        await reservation.populate([
            { path: 'restaurantID', select: 'name city address phone' },
            { path: 'mesaID', select: 'numero capacidad ubicacion' },
        ]);

        // Obtener email del cliente desde la base de datos del PostgreSQL si es posible
        // Por ahora, usaremos el clienteId para enviar notificaciones
        const clienteEmail = req.body.clienteEmail; // El frontend debe proporcionar el email

        // Enviar email al cliente
        if (clienteEmail) {
            const fechaFormato = new Date(reservation.fechaReserva).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            console.log(`📧 Intentando enviar email de ${nuevoEstado === 'CONFIRMADA' ? 'aprobación' : 'rechazo'} a: ${clienteEmail}`);

            try {
                if (nuevoEstado === 'CONFIRMADA') {
                    await enviarEmailReservacionAprobada({
                        email: clienteEmail,
                        nombre: reservation.clienteNombre,
                        restaurante: reservation.restaurantID?.name || 'Restaurante',
                        fecha: fechaFormato,
                        hora: `${reservation.horaInicio} - ${reservation.horaFin}`,
                        personas: reservation.cantidadPersonas,
                        mesaNumero: reservation.mesaID?.numero || 'Por asignar',
                        direccion: reservation.restaurantID?.address || '',
                        telefono: reservation.restaurantID?.phone || ''
                    });
                    console.log(`✅ Email de aprobación de reservación enviado exitosamente a ${clienteEmail}`);
                } else {
                    await enviarEmailReservacionRechazada({
                        email: clienteEmail,
                        nombre: reservation.clienteNombre,
                        restaurante: reservation.restaurantID?.name || 'Restaurante',
                        fecha: fechaFormato,
                        hora: `${reservation.horaInicio} - ${reservation.horaFin}`,
                        razon: razon || 'No disponible para esa fecha/hora'
                    });
                    console.log(`✅ Email de rechazo de reservación enviado exitosamente a ${clienteEmail}`);
                }
            } catch (emailError) {
                console.error(`❌ Error al enviar email de ${nuevoEstado === 'CONFIRMADA' ? 'aprobación' : 'rechazo'} a ${clienteEmail}:`, emailError.message);
            }
        } else {
            console.warn('⚠️  No se proporcionó email del cliente. Los emails de aprobación/rechazo NO se enviarán.');
            console.warn(`   Para enviar emails, incluye "clienteEmail" en el body de la solicitud`);
        }

        // Notificar al cliente en tiempo real
        notifyReservationStatusChange(reservation.clienteId, {
            _id: reservation._id,
            estado: reservation.estado,
            fechaReserva: reservation.fechaReserva,
            horaInicio: reservation.horaInicio,
            horaFin: reservation.horaFin,
            restaurante: reservation.restaurantID,
            mesa: reservation.mesaID
        });

        res.status(200).json({
            success: true,
            message: `Reservación ${accion.toLowerCase()}ada exitosamente`,
            data: reservation,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: 'Error al aprobar/rechazar reservación',
            error: error.message,
        });
    }
};

// Debug endpoint: devuelve los restaurantes gestionados por el usuario autenticado
export const debugManagedRestaurants = async (req, res) => {
    try {
        const userId = req.usuario?.sub;
        if (!userId) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

        const managed = await getManagedRestaurantIds(userId);
        return res.status(200).json({ success: true, user: req.usuario || null, managed });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener restaurantes gestionados', error: error.message });
    }
};
