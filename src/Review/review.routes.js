import { Router } from 'express';
import { createReview, getReviews, deleteReview } from './review.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import { validarCampos } from '../../middlewares/validator.middleware.js';
import { body, param } from 'express-validator';

const router = Router();

router.post(
  '/create',
  autenticar,
  body('restaurantID').notEmpty().isMongoId().withMessage('ID de restaurante requerido'),
  body('rating').notEmpty().isInt({ min: 1, max: 5 }).withMessage('Rating debe ser 1-5'),
  body('comment').optional().isString().isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
  validarCampos,
  createReview
);

router.get(
  '/get',
  getReviews
);

router.delete(
  '/:id',
  autenticar,
  param('id').isMongoId().withMessage('ID de reseña inválido'),
  validarCampos,
  deleteReview
);

export default router;