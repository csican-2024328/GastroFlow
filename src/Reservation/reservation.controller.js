import Reservation from './reservation.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import Mesa from '../Mesas/mesa.model.js';
import { findUserById } from '../../helper/user-db.js';

const isClientRole = (req) => req.usuario?.role === 'CLIENT';
const isRestaurantAdminRole = (req) => req.usuario?.role === 'RESTAURANT_ADMIN';
const isPlatformAdminRole = (req) => req.usuario?.role === 'PLATFORM_ADMIN';

const getManagedRestaurantIds = async (adminUserId) => {
    const adminUser = await findUserById(adminUserId);

    if (!adminUser || !adminUser.Status || !adminUser.Email) {
        return [];
    }

    const restaurants = await Restaurant.find({
        email: adminUser.Email.toLowerCase(),
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

const hasReservationConflict = async ({ mesaID, fechaReserva, excludeId }) => {
    const filter = {
        mesaID,
        fechaReserva: new Date(fechaReserva),
        isActive: true,
        estado: { $in: ['PENDIENTE', 'CONFIRMADA'] },
    };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    const conflict = await Reservation.findOne(filter);
    return !!conflict;
};

export const createReservation = async (req, res) => {
    try {
        const { restaurantID, mesaID, fechaReserva, cantidadPersonas, notas } = req.body;

        const requesterId = req.usuario?.sub;
        if (!requesterId) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido: no se pudo identificar al usuario',
            });
        }

        const clienteId = isClientRole(req) ? requesterId : (req.body.clienteId || requesterId);
        const clientUser = await findUserById(clienteId);

        if (!clientUser || !clientUser.Status) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado o inactivo',
            });
        }

        await validateRestaurantAndMesa(restaurantID, mesaID);

        const conflict = await hasReservationConflict({ mesaID, fechaReserva });
        if (conflict) {
            return res.status(409).json({
                success: false,
                message: 'La mesa ya tiene una reservación en esa fecha y hora',
            });
        }

        const reservation = new Reservation({
            restaurantID,
            mesaID,
            clienteId,
            clienteNombre: `${clientUser.Name || ''} ${clientUser.Surname || ''}`.trim() || clientUser.Username,
            clienteTelefono: clientUser.Phone || clientUser.UserProfile?.Phone || '',
            fechaReserva: new Date(fechaReserva),
            cantidadPersonas,
            notas,
            estado: 'PENDIENTE',
        });

        await reservation.save();
        await reservation.populate([
            { path: 'restaurantID', select: 'name city address phone' },
            { path: 'mesaID', select: 'numero capacidad ubicacion' },
        ]);

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

        const filter = { isActive: true };

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
            if (restaurantID) filter.restaurantID = restaurantID;
            if (mesaID) filter.mesaID = mesaID;
            filter.clienteId = req.query.clienteId;
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

        if (updateData.restaurantID || updateData.mesaID) {
            await validateRestaurantAndMesa(restaurantID, mesaID);
        }

        if (updateData.mesaID || updateData.fechaReserva) {
            const conflict = await hasReservationConflict({
                mesaID,
                fechaReserva,
                excludeId: reservation._id,
            });

            if (conflict) {
                return res.status(409).json({
                    success: false,
                    message: 'La mesa ya tiene una reservación en esa fecha y hora',
                });
            }
        }

        const updatedReservation = await populateReservation(
            Reservation.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            })
        );

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
