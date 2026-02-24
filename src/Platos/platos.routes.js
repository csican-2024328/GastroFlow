import { Router } from 'express';
import {
    changePlatoStatus,
    createPlato,
    getPlatoById,
    getPlatos,
    getMenuByRestaurant,
    updatePlato
} from './platos-controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import { uploadPlatoPhoto, handleMulterError } from '../../middlewares/upload.middleware.js';
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
    uploadPlatoPhoto.single('foto'),
    handleMulterError,
    validateCreatePlato,
    validarCampos,
    createPlato
);

router.get('/get', getPlatos);

router.get('/menu/:restaurantID', getMenuByRestaurant);

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
    uploadPlatoPhoto.single('foto'),
    handleMulterError,
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
    changePlatoStatus
);

router.put(
    '/:id/deactivate',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validatePlatoId,
    validarCampos,
    changePlatoStatus
);

export default router;