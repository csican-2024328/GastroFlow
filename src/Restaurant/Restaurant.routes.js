import { Router } from 'express';
import { createRestaurant } from './Restaurant.controller.js';
import { getRestaurants } from './Restaurant.controller.js';
import { getRestaurantById } from './Restaurant.controller.js';
import { updateRestaurant } from './Restaurant.controller.js';
import { changeRestaurantStatus } from './Restaurant.controller.js';

const router = Router();

router.post(
    '/create', 
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
    updateRestaurant
);

router.put(
    '/:id/activate', 
    changeRestaurantStatus
);
router.put(
    '/:id/deactivate', 
    changeRestaurantStatus
);

export default router;