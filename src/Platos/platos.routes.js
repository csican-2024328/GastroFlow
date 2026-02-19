import { Router } from 'express';
import { changePlatoStatus, createPlato, getPlatoById, getPlatos, getMenuByRestaurant, updatePlato } from './platos-controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    createPlato
)

router.get(
    '/get',
    getPlatos
)

router.get('/menu/:restaurantID', getMenuByRestaurant)

router.get('/:id', getPlatoById);

router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    updatePlato
);

router.put('/:id/activate', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), changePlatoStatus);

router.put('/:id/deactivate', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), changePlatoStatus);

export default router;
