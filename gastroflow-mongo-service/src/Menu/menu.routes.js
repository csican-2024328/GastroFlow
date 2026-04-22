import { Router } from 'express';
import {
	createMenu,
	getMenus,
	getMenuById,
	updateMenu,
	changeMenuStatus,
	getMenuByRestaurant,
} from './menu.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import { uploadPlatoPhoto, handleMulterError } from '../../middlewares/upload.middleware.js';
import { validateCreateMenu, validateMenuId, validateUpdateMenu } from '../../middlewares/menu.validator.js';

const router = Router();

router.post(
	'/create',
	autenticar,
	autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
	uploadPlatoPhoto.single('foto'),
	handleMulterError,
	validateCreateMenu,
	validarCampos,
	createMenu
);

router.get('/get', getMenus);

router.get('/menu/:restaurantID', getMenuByRestaurant);

router.get('/:id', validateMenuId, validarCampos, getMenuById);

router.put(
	'/:id',
	autenticar,
	autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
	uploadPlatoPhoto.single('foto'),
	handleMulterError,
	validateUpdateMenu,
	validarCampos,
	updateMenu
);

router.put('/:id/activate', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), validateMenuId, validarCampos, changeMenuStatus);

router.put('/:id/deactivate', autenticar, autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'), validateMenuId, validarCampos, changeMenuStatus);

export default router;
