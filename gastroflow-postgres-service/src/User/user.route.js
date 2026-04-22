import { Router } from 'express';
import { body, param } from 'express-validator';
import {
	changeUserRole,
	getRolesCatalog,
	getUserById,
	getUsers,
	toggleUserStatus,
} from './user.admin.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';

const router = Router();

router.get('/', autenticar, autorizarRole('PLATFORM_ADMIN'), getUsers);

router.get('/roles', autenticar, autorizarRole('PLATFORM_ADMIN'), getRolesCatalog);

router.get(
	'/:id',
	autenticar,
	autorizarRole('PLATFORM_ADMIN'),
	param('id').trim().notEmpty().withMessage('ID de usuario requerido'),
	validarCampos,
	getUserById
);

router.patch(
	'/:id/role',
	autenticar,
	autorizarRole('PLATFORM_ADMIN'),
	param('id').trim().notEmpty().withMessage('ID de usuario requerido'),
	body('roleName').trim().notEmpty().withMessage('El rol es requerido'),
	validarCampos,
	changeUserRole
);

router.patch(
	'/:id/status',
	autenticar,
	autorizarRole('PLATFORM_ADMIN'),
	param('id').trim().notEmpty().withMessage('ID de usuario requerido'),
	body('status').isBoolean().withMessage('El status debe ser booleano'),
	validarCampos,
	toggleUserStatus
);

export default router;
