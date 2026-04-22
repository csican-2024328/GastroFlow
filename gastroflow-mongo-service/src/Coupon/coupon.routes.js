'use strict';

import { Router } from 'express';
import {
  createCoupon,
  getCoupons,
  getCouponByCode,
  getCouponById,
  updateCoupon,
  deactivateCoupon,
  activateCoupon,
  getCuponeVigentes,
  validateCoupon,
  deleteCoupon,
} from './coupon.controller.js';

import { autenticar, autorizarRole } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import {
  validateCreateCoupon,
  validateUpdateCoupon,
  validateCouponId,
} from '../../middlewares/coupon.validator.js';

const router = Router();

// Rutas POST
router.post(
  '/create',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  validateCreateCoupon,
  validarCampos,
  createCoupon
);

router.post(
  '/validate',
  validateCoupon
);

// Rutas GET - orden importante: específicas ANTES que parámetros
router.get('/get', getCoupons);

router.get(
  '/code/:codigo',
  getCouponByCode
);

router.get(
  '/restaurant/:restaurantID/vigentes',
  getCuponeVigentes
);

// Rutas PUT - específicas antes que parámetros
router.put(
  '/:id/activate',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  validateCouponId,
  validarCampos,
  activateCoupon
);

router.put(
  '/:id/deactivate',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  validateCouponId,
  validarCampos,
  deactivateCoupon
);

router.put(
  '/:id',
  autenticar,
  autorizarRole('RESTAURANT_ADMIN', 'PLATFORM_ADMIN'),
  validateUpdateCoupon,
  validarCampos,
  updateCoupon
);

// Rutas DELETE
router.delete(
  '/:id',
  autenticar,
  autorizarRole('PLATFORM_ADMIN'),
  validateCouponId,
  validarCampos,
  deleteCoupon
);

// Rutas GET con parámetros al final
router.get(
  '/:id',
  validateCouponId,
  validarCampos,
  getCouponById
);

export default router;
