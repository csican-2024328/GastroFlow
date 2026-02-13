import express from 'express';
import {
    registro,
    login,
    verificarEmail,
    refreshToken,
    obtenerPerfil,
    actualizarPerfil,
    cambiarContraseña,
    solicitarResetPassword,
    resetPassword,
    logout
} from './auth.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);
router.post('/verificar-email', verificarEmail);
router.post('/refresh', refreshToken);
router.post('/olvide-contraseña', solicitarResetPassword);
router.put('/reset-contraseña/:token', resetPassword);

// Rutas privadas (requieren autenticación)
router.get('/me', autenticar, obtenerPerfil);
router.put('/actualizar', autenticar, actualizarPerfil);
router.put('/cambiar-contraseña', autenticar, cambiarContraseña);
router.post('/logout', autenticar, logout);

export default router;
