import { Router } from 'express';
import { createRestaurant } from './Restaurant.controller.js';
import { getRestaurants } from './Restaurant.controller.js';
import { getRestaurantById } from './Restaurant.controller.js';
import { updateRestaurant } from './Restaurant.controller.js';
import { changeRestaurantStatus } from './Restaurant.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    createRestaurant
);

router.get(
    '/get', 
    getRestaurants
);

router.get(
    '/:id', 
    getRestaurantById
);

router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    updateRestaurant
);

router.put(
    '/:id/activate',
    autenticar,
    autorizarRole('PLATFORM_ADMIN'),
    changeRestaurantStatus
);
router.put(
    '/:id/deactivate',
    autenticar,
    autorizarRole('PLATFORM_ADMIN'),
    changeRestaurantStatus
);

export default router;