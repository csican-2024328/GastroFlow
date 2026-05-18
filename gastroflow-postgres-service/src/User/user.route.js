import { Router } from 'express';
import { body, param } from 'express-validator';
import {
	changeUserRole,
	createUserAdmin,
	getRolesCatalog,
	getUserById,
	getUsers,
	toggleUserStatus,
} from './user.admin.controller.js';
import { assignRestaurantToUser } from '../auth/auth.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';

const router = Router();

router.get('/', autenticar, autorizarRole('PLATFORM_ADMIN'), getUsers);

router.post(
  '/',
  autenticar,
  autorizarRole('PLATFORM_ADMIN'),
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('surname').trim().notEmpty().withMessage('El apellido es requerido'),
  body('username').trim().notEmpty().withMessage('El usuario es requerido'),
  body('email').trim().isEmail().withMessage('El email es requerido y debe ser válido'),
  body('phone').trim().notEmpty().withMessage('El teléfono es requerido'),
  body('password').trim().isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('role').trim().notEmpty().withMessage('El rol es requerido'),
  validarCampos,
  createUserAdmin
);

router.get('/roles', autenticar, autorizarRole('PLATFORM_ADMIN'), getRolesCatalog);

router.get(
	'/:id',
	autenticar,
	autorizarRole('PLATFORM_ADMIN'),
	param('id').trim().notEmpty().withMessage('ID de usuario requerido'),
	validarCampos,
	getUserById
);

const roleUpdateValidators = [
	param('id').trim().notEmpty().withMessage('ID de usuario requerido'),
	body(['roleName', 'role'])
		.custom((value, { req }) => {
			const roleValue = req.body.roleName || req.body.role;
			if (!roleValue || !roleValue.toString().trim()) {
				throw new Error('El rol es requerido');
			}
			return true;
		})
		.withMessage('El rol es requerido'),
	validarCampos,
];

router.patch(
	'/:id/role',
	autenticar,
	autorizarRole('PLATFORM_ADMIN'),
	...roleUpdateValidators,
	changeUserRole
);

router.put(
	'/:id/role',
	autenticar,
	autorizarRole('PLATFORM_ADMIN'),
	...roleUpdateValidators,
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

router.put(
  '/:id/assign-restaurant',
  autenticar,
  autorizarRole('PLATFORM_ADMIN'),
  param('id').trim().notEmpty().withMessage('ID de usuario requerido'),
  validarCampos,
  assignRestaurantToUser
);

export default router;
