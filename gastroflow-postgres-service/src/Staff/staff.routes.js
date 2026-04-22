import { Router } from 'express';
import { createStaff, getStaff, getStaffById, updateStaff, toggleStaffStatus, deleteStaff } from './staff.controller.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import { body, param } from 'express-validator';

const router = Router();

router.post(
  '/create',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  body('name').notEmpty().isString().withMessage('Nombre requerido'),
  body('surname').notEmpty().isString().withMessage('Apellido requerido'),
  body('restaurantId').notEmpty().isMongoId().withMessage('ID de restaurante inválido'),
  body('role').notEmpty().isString().withMessage('Rol requerido'),
  validarCampos,
  createStaff
);

router.get(
  '/get',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  getStaff
);

router.get(
  '/:id',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  param('id').notEmpty().isString().withMessage('ID inválido'),
  validarCampos,
  getStaffById
);

router.put(
  '/:id',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  param('id').notEmpty().isString().withMessage('ID inválido'),
  validarCampos,
  updateStaff
);

router.patch(
  '/:id/status',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  param('id').notEmpty().isString().withMessage('ID inválido'),
  body('status').isBoolean().withMessage('Status requerido'),
  validarCampos,
  toggleStaffStatus
);

router.delete(
  '/:id',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  param('id').notEmpty().isString().withMessage('ID inválido'),
  validarCampos,
  deleteStaff
);

export default router;