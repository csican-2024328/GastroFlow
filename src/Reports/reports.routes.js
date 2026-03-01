import express from 'express';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();
import {
    topPlatos,
    ingresosPorFecha,
    horariosOcupacion,
    clientesFrecuentes,
    estadisticasCliente,
    platoFavoritoCliente,
    pedidosRecurrentes,
    demandaRestaurantes,
    horasPico,
    reporteReservaciones,
    desempenoRestaurante,
    exportarReportePDF,
    exportarTodosReportesPDF,
    exportarReportePorTipo
} from './reports.controller.js';

router.get(
    '/demanda-restaurantes',
    autenticar,
    autorizarRole('PLATFORM_ADMIN'),
    demandaRestaurantes
);

router.get(
    '/horas-pico',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    horasPico
);

router.get(
    '/reservaciones',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    reporteReservaciones
);

router.get(
    '/desempeno-restaurante',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    desempenoRestaurante
);

router.get(
    '/exportar/reporte/:tipo/:formato',
    autenticar,
    autorizarRole('PLATFORM_ADMIN', 'RESTAURANT_ADMIN'),
    exportarReportePorTipo
);
// Exportar reporte individual a PDF (solo para roles autorizados)
router.get(
    '/exportar/:reporteId/pdf',
    autenticar,
    autorizarRole('PLATFORM_ADMIN', 'RESTAURANT_ADMIN'),
    exportarReportePDF
);

// Exportar todos los reportes a PDF (solo para roles autorizados)
router.get(
    '/exportar/pdf',
    autenticar,
    autorizarRole('PLATFORM_ADMIN', 'RESTAURANT_ADMIN'),
    exportarTodosReportesPDF
);

router.get(
    '/top-platos',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    topPlatos
);

router.get(
    '/ingresos',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    ingresosPorFecha
);

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