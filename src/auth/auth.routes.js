
import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import {
  authRateLimit,
  requestLimit,
} from '../../middlewares/request-limit.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  validateAssignRole,
  validarCampos,
} from '../../middlewares/validator.middleware.js';
import { updateProfile } from '../User/user.admin.controller.js';

const router = Router();

router.post(
  '/register',
  authRateLimit,
  validateRegister,
  validarCampos,
  authController.register
);

router.post(
  '/login',
  authRateLimit,
  validateLogin,
  validarCampos,
  authController.login
);

router.post(
  '/verify-email',
  requestLimit,
  validateVerifyEmail,
  validarCampos,
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authRateLimit,
  validateResendVerification,
  validarCampos,
  authController.resendVerification
);

router.post(
  '/forgot-password',
  authRateLimit,
  validateForgotPassword,
  validarCampos,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimit,
  validateResetPassword,
  validarCampos,
  authController.resetPassword
);

router.get('/profile', validateJWT, authController.getProfile);

router.put('/profile', updateProfile);

router.delete('/profile', validateJWT, authController.deleteProfile);

router.post('/profile/by-id', requestLimit, authController.getProfileById);

router.put(
  '/assign-role',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  validateAssignRole,
  validarCampos,
  authController.assignRole
);

export default router;
