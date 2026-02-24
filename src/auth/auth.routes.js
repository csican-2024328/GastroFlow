import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  authRateLimit,
  requestLimit,
} from '../../middlewares/request-limit.js';

const router = Router();

router.post(
  '/register',
  authRateLimit,
  authController.register
);

router.post('/login', authRateLimit, authController.login);

router.post(
  '/verify-email',
  requestLimit,
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authRateLimit,
  authController.resendVerification
);

router.post(
  '/forgot-password',
  authRateLimit,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimit,
  authController.resetPassword
);

router.get('/profile', validateJWT, authController.getProfile);

router.post('/profile/by-id', requestLimit, authController.getProfileById);

export default router;
