import { Router } from 'express';
import * as restaurantController from './Restaurant.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.post('/create', validateJWT, restaurantController.createRestaurant);
router.get('/get', restaurantController.getRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.put('/:id', validateJWT, restaurantController.updateRestaurant);
router.put('/:id/activate', validateJWT, restaurantController.activateRestaurant);
router.put('/:id/deactivate', validateJWT, restaurantController.deactivateRestaurant);

export default router;