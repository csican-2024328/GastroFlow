import { Router } from 'express';
import { createReview, getReviews, getReviewById, updateReview, deleteReview } from './review.controller.js';
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

router.get(
  '/:id',
  autenticar,
  param('id').isMongoId().withMessage('ID de reseña inválido'),
  validarCampos,
  getReviewById
);

router.put(
  '/:id',
  autenticar,
  param('id').isMongoId().withMessage('ID de reseña inválido'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating debe ser 1-5'),
  body('comment').optional().isString().isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
  body().custom((value) => {
    if (value.rating === undefined && value.comment === undefined) {
      throw new Error('Debes enviar rating o comment para actualizar');
    }
    return true;
  }),
  validarCampos,
  updateReview
);

router.delete(
  '/:id',
  autenticar,
  param('id').isMongoId().withMessage('ID de reseña inválido'),
  validarCampos,
  deleteReview
);

export default router;