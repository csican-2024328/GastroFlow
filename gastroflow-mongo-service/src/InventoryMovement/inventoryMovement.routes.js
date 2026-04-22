import { Router } from 'express';
import { getInventoryMovementById, getInventoryMovements } from './inventoryMovement.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get(
  '/get',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  getInventoryMovements
);

router.get(
  '/:id',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  getInventoryMovementById
);

export default router;
