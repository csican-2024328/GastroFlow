import express from 'express';
import {
    topPlatos,
    ingresosPorFecha,
    horariosOcupacion,
    clientesFrecuentes,
    estadisticasCliente,
    platoFavoritoCliente,
    pedidosRecurrentes
} from './reports.controller.js';

import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
    '/top-platos', 
    autenticar, 
    autorizarRole('PLATFORM_ADMIN'), 
    topPlatos);

router.get(
    '/ingresos', 
    autenticar, 
    autorizarRole('PLATFORM_ADMIN'), 
    ingresosPorFecha);

router.get(
    '/ocupacion', 
    autenticar, 
    autorizarRole('PLATFORM_ADMIN'), 
    horariosOcupacion);

/**
 * Nuevos endpoints de análisis de clientes
 */
router.get(
    '/clientes-frecuentes',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    clientesFrecuentes
);

router.get(
    '/cliente/:nombreCliente',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    estadisticasCliente
);

router.get(
    '/cliente/:nombreCliente/plato-favorito',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    platoFavoritoCliente
);

router.get(
    '/pedidos-recurrentes',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    pedidosRecurrentes
);

export default router;