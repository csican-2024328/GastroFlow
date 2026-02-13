import { Router } from 'express';
import { createMesa, getMesas, getMesaById, updateMesa, deleteMesa } from './mesa.controller.js';

const router = Router();

router.post('/create', createMesa);
router.get('/get', getMesas);
router.get('/:id', getMesaById);
router.put('/:id', updateMesa);
router.delete('/:id', deleteMesa);

export default router;
