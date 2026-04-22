import express from 'express';
import { getIO } from '../../configs/socket.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import { param } from 'express-validator';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    seedTestNotification,
} from './notifications.controller.js';
import Notification from './notification.model.js';

const router = express.Router();

router.get('/', autenticar, getMyNotifications);

router.patch('/read-all', autenticar, markAllNotificationsAsRead);

router.patch(
    '/:id/read',
    autenticar,
    param('id').isMongoId().withMessage('ID de notificación inválido'),
    validarCampos,
    markNotificationAsRead
);

router.post('/seed-test', autenticar, seedTestNotification);

// Test endpoint para verificar que socket.io está funcionando
router.get('/test', (req, res) => {
    try {
        const io = getIO();
        res.json({
            success: true,
            message: 'Socket.io está activo',
            clients: io.engine.clientsCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Emitir una notificación de prueba y guardarla en MongoDB
router.post('/emit-test', async (req, res) => {
    try {
        const {
            targetType = 'restaurant',
            targetId,
            event = 'test-notification',
            type = 'TEST_NOTIFICATION',
            message = 'Notificación de prueba',
            data = {}
        } = req.body;

        if (!['restaurant', 'client', 'broadcast'].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: 'targetType debe ser restaurant, client o broadcast'
            });
        }

        if (targetType !== 'broadcast' && !targetId) {
            return res.status(400).json({
                success: false,
                message: 'targetId es requerido cuando targetType no es broadcast'
            });
        }

        const io = getIO();
        const room =
            targetType === 'broadcast'
                ? 'broadcast'
                : `${targetType}-${targetId}`;

        const payload = {
            type,
            message,
            data,
            timestamp: new Date(),
        };

        if (targetType === 'broadcast') {
            io.emit(event, payload);
        } else {
            io.to(room).emit(event, payload);
        }

        // Persistencia real para bandeja del cliente
        if (targetType === 'client') {
            await Notification.create({
                userId: String(targetId),
                type,
                message,
                data,
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Notificación emitida exitosamente',
            data: {
                targetType,
                targetId: targetType === 'broadcast' ? null : targetId,
                room,
                event,
                type,
                message,
                payload: data,
                clients: io.engine.clientsCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al emitir notificación de prueba',
            error: error.message,
        });
    }
});

export default router;
