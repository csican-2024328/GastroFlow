import Reservation from './reservation.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import Mesa from '../Mesas/mesa.model.js';
import { notifyNewReservation, notifyReservationStatusChange } from '../../configs/socket.js';
import { enviarEmailAlertaTiempoReal } from '../../helper/email-service.js';

const isClientRole = (req) => req.usuario?.role === 'CLIENT';
const isRestaurantAdminRole = (req) => req.usuario?.role === 'RESTAURANT_ADMIN';
const isPlatformAdminRole = (req) => req.usuario?.role === 'PLATFORM_ADMIN';

const getManagedRestaurantIds = async (adminUserId) => {
    // Note: En MongoDB, los restaurantes se validan por admin_user_id o email
    // Este es un método simplificado que obtiene los restaurantes del admin
    const restaurants = await Restaurant.find({
        admin_user_id: adminUserId,
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
        return managedRestaurantIds.includes(reservation.restaurantID.toString());
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
    
    // Función para convertir hora HH:mm a minutos
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Función para detectar superposición de horarios
    const hasTimeOverlap = (start1, end1, start2, end2) => {
        const s1 = timeToMinutes(start1);
        const e1 = timeToMinutes(end1);
        const s2 = timeToMinutes(start2);
        const e2 = timeToMinutes(end2);
        return s1 < e2 && e1 > s2;
    };

    for (const reservation of conflictingReservations) {
        if (hasTimeOverlap(horaInicio, horaFin, reservation.horaInicio, reservation.horaFin)) {
            return true;
        }
    }
    
    return false;
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
        if (conflict) {
            return res.status(409).json({
                success: false,
                message: 'La mesa ya tiene una reservación en ese rango de horas',
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
            fechaReserva: new Date(fechaReserva),
            horaInicio,
            horaFin,
            cantidadPersonas,
            notas,
            estado: 'CONFIRMADA',
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

        if (requesterEmail) {
            await enviarEmailAlertaTiempoReal({
                to: requesterEmail,
                asunto: 'Alerta Tiempo Real: Nueva reservación',
                titulo: 'Nueva reservación emitida por socket',
                mensaje: 'Se emitió el evento nueva-reserva para validar notificaciones en tiempo real.',
                detalles: [
                    { label: 'Reserva ID', value: reservation._id?.toString() },
                    { label: 'Restaurante', value: restaurantID },
                    { label: 'Cliente', value: reservation.clienteNombre },
                    { label: 'Fecha', value: reservation.fechaReserva?.toISOString?.() || reservation.fechaReserva },
                    { label: 'Hora', value: `${reservation.horaInicio} - ${reservation.horaFin}` },
                    { label: 'Estado', value: reservation.estado },
                ],
            }).catch(err => console.error('Error enviando email:', err));
        }

        res.status(201).json({
            success: true,
            message: 'Reservación creada exitosamente',
            data: reservation,
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

            if (managedRestaurantIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Reservaciones obtenidas exitosamente',
                    data: [],
                    pagination: {
                        total: 0,
                        pages: 0,
                        currentPage: parsedPage,
                        limit: parsedLimit,
                    },
                });
            }

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

            if (conflict) {
                return res.status(409).json({
                    success: false,
                    message: 'La mesa ya tiene una reservación en ese rango de horas',
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
