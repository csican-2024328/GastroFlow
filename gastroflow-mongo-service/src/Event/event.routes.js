import { Router } from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    activateEvent,
    deactivateEvent,
    deleteEvent,
    useEvent,
    getEventosVigentes
} from './event.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
    validateCreateEvent,
    validateUpdateEvent,
    validateEventId,
    validateRestaurantId
} from '../../middlewares/event.validator.js';

const router = Router();

router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateCreateEvent,
    validarCampos,
    createEvent
);

router.get(
    '/get',
    autenticar,
    getEvents
);

router.get(
    '/restaurant/:restaurantID/vigentes',
    validateRestaurantId,
    validarCampos,
    getEventosVigentes
);

router.post(
    '/:id/usar',
    autenticar,
    validateEventId,
    validarCampos,
    useEvent
);

router.put(
    '/:id/activate',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateEventId,
    validarCampos,
    activateEvent
);

router.put(
    '/:id/deactivate',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateEventId,
    validarCampos,
    deactivateEvent
);


router.delete(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateEventId,
    validarCampos,
    deleteEvent
);


router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    validateUpdateEvent,
    validarCampos,
    updateEvent
);

router.get(
    '/:id',
    autenticar,
    validateEventId,
    validarCampos,
    getEventById
);

export default router;
