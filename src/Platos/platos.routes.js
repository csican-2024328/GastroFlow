import { Router } from 'express';
import { changePlayStatus, createPlato, getPlatoById, getPlatos, updatePlato } from './platos-controller.js';
import { uploadPlayImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreatePlato, validatePlayStatusChange, validateGetPlatoById, validateUpdatePlayRequest } from '../../middlewares/platos-validators.js';

const router = Router();

router.post(
    '/create',
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
    uploadPlayImage.single('image'),
    cleanUploaderFileOnFinish,
    validateUpdatePlayRequest,
    updatePlato
);

router.put('/:id/activate', validatePlayStatusChange, changePlayStatus);

router.put('/:id/deactivate', validatePlayStatusChange, changePlayStatus);

export default router;
