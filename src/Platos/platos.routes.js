import { Router } from 'express';
import {
    createPlato,
    getPlatos,
    getPlatoById,
    updatePlato,
    changePlayStatus
} from './platos-controller.js';

import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreatePlato,
    validatePlatoId,
    validateUpdatePlato
} from '../../middlewares/platos.validator.js';

const router = Router();

router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCreatePlato,
    validarCampos,
    createPlato
);

router.get('/get', getPlatos);

router.get(
    '/:id',
    validatePlatoId,
    validarCampos,
    getPlatoById
);

router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdatePlato,
    validarCampos,
    updatePlato
);

router.put(
    '/:id/activate',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validatePlatoId,
    validarCampos,
    changePlayStatus
);

router.put(
    '/:id/deactivate',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validatePlatoId,
    validarCampos,
    changePlayStatus
);

export default router;