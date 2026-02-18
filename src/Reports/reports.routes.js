import express from 'express';
import {
    topPlatos,
    ingresosPorFecha,
    horariosOcupacion
} from './reports.controller.js';

import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
    '/top-platos', 
    autenticar, 
    autorizarRole('ADMIN'), 
    topPlatos);

router.get(
    '/ingresos', 
    autenticar, 
    autorizarRole('ADMIN'), 
    ingresosPorFecha);

router.get(
    '/ocupacion', 
    autenticar, 
    autorizarRole('ADMIN'), 
    horariosOcupacion);

export default router;