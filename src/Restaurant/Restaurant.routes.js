import { Router } from 'express';
import {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    activateRestaurant,
    deactivateRestaurant,
    deleteRestaurant,
    changeRestaurantStatus
} from './Restaurant.controller.js';

import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreateRestaurant,
    validateRestaurantId,
    validateUpdateRestaurant,
    validateRestaurantStatus
} from '../../middlewares/restaurant.validator.js';

const router = Router();

router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCreateRestaurant,
    validarCampos,
    createRestaurant
);

router.get('/get', getRestaurants);

router.get(
    '/:id',
    validateRestaurantId,
    validarCampos,
    getRestaurantById
);

router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateRestaurant,
    validarCampos,
    updateRestaurant
);

router.put(
    '/:id/activate',
    autenticar,
    autorizarRole('PLATFORM_ADMIN'),
    validateRestaurantStatus,
    validarCampos,
    activateRestaurant
);

router.put(
    '/:id/deactivate',
    autenticar,
    autorizarRole('PLATFORM_ADMIN'),
    validateRestaurantStatus,
    validarCampos,
    deactivateRestaurant
);

router.delete(
    '/:id',
    autenticar,
    autorizarRole('PLATFORM_ADMIN'),
    validateRestaurantId,
    validarCampos,
    deleteRestaurant
);

export default router;