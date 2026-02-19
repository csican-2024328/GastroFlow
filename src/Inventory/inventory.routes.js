import { Router } from 'express';
import {
    createInventoryItem,
    getInventoryItems,
    getInventoryItemById,
    updateInventoryItem,
    deleteInventoryItem
} from './inventory.controller.js';

import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreateInventory,
    validateInventoryId,
    validateUpdateInventory
} from '../../middlewares/inventory.validator.js';

const router = Router();

router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCreateInventory,
    validarCampos,
    createInventoryItem
);

router.get(
    '/get',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    getInventoryItems
);

router.get(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateInventoryId,
    validarCampos,
    getInventoryItemById
);

router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateInventory,
    validarCampos,
    updateInventoryItem
);

router.delete(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateInventoryId,
    validarCampos,
    deleteInventoryItem
);

export default router;