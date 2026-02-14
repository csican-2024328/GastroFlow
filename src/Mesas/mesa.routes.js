import { Router } from 'express';
import { createMesa, getMesas, getMesaById, updateMesa, deleteMesa } from './mesa.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), createMesa);
router.get('/get', getMesas);
router.get('/:id', getMesaById);
router.put('/:id', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), updateMesa);
router.delete('/:id', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), deleteMesa);

export default router;
