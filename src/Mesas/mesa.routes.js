import { Router } from 'express';
import {
    createMesa,
    getMesas,
    getMesaById,
    updateMesa,
    deleteMesa
} from './mesa.controller.js';

import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreateMesa,
    validateMesaId,
    validateUpdateMesa
} from '../../middlewares/mesa.validator.js';

const router = Router();

router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCreateMesa,
    validarCampos,
    createMesa
);

router.get('/get', getMesas);

router.get(
    '/:id',
    validateMesaId,
    validarCampos,
    getMesaById
);

router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateMesa,
    validarCampos,
    updateMesa
);

router.delete(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateMesaId,
    validarCampos,
    deleteMesa
);

export default router;