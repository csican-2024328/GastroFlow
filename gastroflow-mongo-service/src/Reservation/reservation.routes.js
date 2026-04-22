import { Router } from 'express';
import {
    createReservation,
    getReservations,
    getReservationById,
    updateReservation,
    deleteReservation,
} from './reservation.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreateReservation,
    validateUpdateReservation,
    validateReservationId,
    validateDeleteReservation,
} from '../../middlewares/reservation.validator.js';

const router = Router();

router.post(
    '/',
    autenticar,
    autorizarRole('CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCreateReservation,
    validarCampos,
    createReservation
);

router.get(
    '/',
    autenticar,
    autorizarRole('CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    getReservations
);

router.get(
    '/:id',
    autenticar,
    autorizarRole('CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateReservationId,
    validarCampos,
    getReservationById
);

router.put(
    '/:id',
    autenticar,
    autorizarRole('CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateReservation,
    validarCampos,
    updateReservation
);

router.delete(
    '/:id',
    autenticar,
    autorizarRole('CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateDeleteReservation,
    validarCampos,
    deleteReservation
);

export default router;
