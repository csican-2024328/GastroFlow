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
    exportarReportePDF,
    exportarTodosReportesPDF
} from './reports.controller.js';
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