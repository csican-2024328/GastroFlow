import { Router } from 'express';
import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    deleteInvoice
} from './invoice.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreateInvoice,
    validateInvoiceId,
    validateUpdateInvoiceStatus
} from '../../middlewares/invoice.validator.js';

const router = Router();

// Crear una nueva factura
router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN', 'USER'), // Dependiendo de quién pueda generar la factura
    validateCreateInvoice,
    validarCampos,
    createInvoice
);

// Obtener todas las facturas (con filtros y paginación) - Preparado para futuro reporte PDF
router.get(
    '/get',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    getInvoices
);

// Obtener una factura por ID
router.get(
    '/:id',
    autenticar,
    validateInvoiceId,
    validarCampos,
    getInvoiceById
);

// Actualizar el estado de una factura
router.put(
    '/:id/status',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateInvoiceStatus,
    validarCampos,
    updateInvoiceStatus
);

// Eliminar una factura (soft delete)
router.delete(
    '/:id',
    autenticar,
    autorizarRole('PLATFORM_ADMIN'),
    validateInvoiceId,
    validarCampos,
    deleteInvoice
);

export default router;
