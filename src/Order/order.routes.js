/**
 * @fileoverview Rutas de la API para Pedidos (Orders)
 * Define todos los endpoints para gestionar pedidos de clientes
 * Incluye autenticación, autorización y validaciones
 */

import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByNumber,
    updateOrder,
    updateOrderStatus,
    payOrder,
    cancelOrder,
    deleteOrderPermanent
} from './order.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreateOrder,
    validateUpdateOrder,
    validateUpdateOrderStatus,
    validatePayOrder,
    validateOrderId,
    validateOrderNumber,
    validateCancelOrder
} from '../../middlewares/order.validator.js';

const router = Router();

/**
 * @route POST /orders/create
 * @desc Crear un nuevo pedido
 * @access Requiere autenticación (CLIENT, RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.post(
    '/create',
    autenticar,
    autorizarRole('CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCreateOrder,
    validarCampos,
    createOrder
);

/**
 * @route GET /orders/get
 * @desc Obtener todos los pedidos con filtros opcionales
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 * @query {string} [restaurantID] - Filtrar por restaurante
 * @query {string} [mesaID] - Filtrar por mesa
 * @query {string} [estado] - Filtrar por estado
 * @query {number} [page=1] - Número de página
 * @query {number} [limit=10] - Items por página
 */
router.get(
    '/get',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    getOrders
);

/**
 * @route GET /orders/numero/:numeroOrden
 * @desc Obtener un pedido por su número de orden
 * @access Requiere autenticación
 */
router.get(
    '/numero/:numeroOrden',
    autenticar,
    validateOrderNumber,
    validarCampos,
    getOrderByNumber
);

/**
 * @route GET /orders/:id
 * @desc Obtener un pedido específico por ID
 * @access Requiere autenticación
 */
router.get(
    '/:id',
    autenticar,
    validateOrderId,
    validarCampos,
    getOrderById
);

/**
 * @route PUT /orders/:id
 * @desc Actualizar los datos de un pedido (solo si está PENDIENTE)
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateOrder,
    validarCampos,
    updateOrder
);

/**
 * @route PUT /orders/:id/estado
 * @desc Actualizar el estado de un pedido
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.put(
    '/:id/estado',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateOrderStatus,
    validarCampos,
    updateOrderStatus
);

/**
 * @route PUT /orders/:id/pagar
 * @desc Registrar el pago de un pedido
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.put(
    '/:id/pagar',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validatePayOrder,
    validarCampos,
    payOrder
);

/**
 * @route DELETE /orders/:id
 * @desc Cancelar un pedido (cambia estado a CANCELADO)
 * @access Requiere autenticación (RESTAURANT_ADMIN, PLATFORM_ADMIN)
 */
router.delete(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCancelOrder,
    validarCampos,
    cancelOrder
);

/**
 * @route DELETE /orders/:id/permanent
 * @desc Eliminar permanentemente un pedido (solo PLATFORM_ADMIN)
 * @access Requiere autenticación (PLATFORM_ADMIN)
 */
router.delete(
    '/:id/permanent',
    autenticar,
    autorizarRole('PLATFORM_ADMIN'),
    validateOrderId,
    validarCampos,
    deleteOrderPermanent
);

export default router;
