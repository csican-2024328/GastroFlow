import express from 'express';
import { getIO } from '../../configs/socket.js';

const router = express.Router();

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

export default router;
