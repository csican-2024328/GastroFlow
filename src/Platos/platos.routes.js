import { Router } from 'express';
import { changePlayStatus, createPlato, getPlatoById, getPlatos, getMenuByRestaurant, updatePlato } from './platos-controller.js';
import { uploadPlayImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreatePlato, validatePlayStatusChange, validateGetPlatoById, validateUpdatePlayRequest } from '../../middlewares/platos-validators.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post(
    '/create',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    uploadPlayImage.single('image'),
    cleanUploaderFileOnFinish,
    validateCreatePlato,
    createPlato
)

router.get(
    '/get',
    getPlatos
)

router.get('/menu/:restaurantID', getMenuByRestaurant)

router.get('/:id', validateGetPlatoById, getPlatoById);

router.put(
    '/:id',
    autenticar,
    autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
    uploadPlayImage.single('image'),
    cleanUploaderFileOnFinish,
    validateUpdatePlayRequest,
    updatePlato
);

router.put('/:id/activate', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), validatePlayStatusChange, changePlayStatus);

router.put('/:id/deactivate', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), validatePlayStatusChange, changePlayStatus);

export default router;
