import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`Cliente conectado: ${socket.id}`);

        // Unirse a sala de restaurante
        socket.on('join-restaurant', (restaurantID) => {
            socket.join(`restaurant-${restaurantID}`);
            console.log(`Socket ${socket.id} se unió a restaurant-${restaurantID}`);
        });

        // Unirse a sala de cliente
        socket.on('join-client', (clientID) => {
            socket.join(`client-${clientID}`);
            console.log(`Socket ${socket.id} se unió a client-${clientID}`);
        });

        socket.on('disconnect', () => {
            console.log(`Cliente desconectado: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io no está inicializado');
    }
    return io;
};

// Notificación de nueva reserva al admin del restaurante
export const notifyNewReservation = (restaurantID, reservation) => {
    if (!io) return;
    
    io.to(`restaurant-${restaurantID}`).emit('nueva-reserva', {
        type: 'NUEVA_RESERVA',
        message: 'Nueva reserva recibida',
        data: reservation,
        timestamp: new Date()
    });
};

// Notificación de cambio de estado al cliente
export const notifyReservationStatusChange = (clientID, reservation) => {
    if (!io) return;
    
    io.to(`client-${clientID}`).emit('cambio-estado-reserva', {
        type: 'CAMBIO_ESTADO_RESERVA',
        message: `Tu reserva cambió a estado: ${reservation.estado}`,
        data: reservation,
        timestamp: new Date()
    });
};

// Notificación de nuevo pedido al admin del restaurante
export const notifyNewOrder = (restaurantID, order) => {
    if (!io) return;
    
    io.to(`restaurant-${restaurantID}`).emit('nuevo-pedido', {
        type: 'NUEVO_PEDIDO',
        message: 'Nuevo pedido recibido',
        data: order,
        timestamp: new Date()
    });
};

// Notificación de cambio de estado de pedido
export const notifyOrderStatusChange = (clientID, order) => {
    if (!io) return;
    
    io.to(`client-${clientID}`).emit('cambio-estado-pedido', {
        type: 'CAMBIO_ESTADO_PEDIDO',
        message: `Tu pedido cambió a estado: ${order.estado}`,
        data: order,
        timestamp: new Date()
    });
};
