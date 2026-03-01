import { Router } from 'express';
import {
    crearInsumo,
    obtenerInsumos,
    obtenerInsumoPorId,
    actualizarInsumo,
    eliminarInsumo
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
    crearInsumo
);

router.get(
    '/get',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    obtenerInsumos
);

router.get(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateInventoryId,
    validarCampos,
    obtenerInsumoPorId
);

router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateInventory,
    validarCampos,
    actualizarInsumo
);

router.delete(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateInventoryId,
    validarCampos,
    eliminarInsumo
);

export default router;