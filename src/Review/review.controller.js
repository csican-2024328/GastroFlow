import Review from './review.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';

const canAccessReview = (req, review) => {
  if (!review) return false;
  if (req.usuario?.role === 'PLATFORM_ADMIN') return true;
  return review.userID?.toString() === req.usuario?.sub;
};

export const createReview = async (req, res) => {
  try {
    const { restaurantID, rating, comment } = req.body;
    const userID = req.usuario?.sub;
    if (!userID) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    if (!restaurantID || !rating) {
      return res.status(400).json({ success: false, message: 'restaurantID y rating son requeridos' });
    }
    const exists = await Restaurant.findById(restaurantID);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }
    const review = await Review.create({ restaurantID, userID, rating, comment });
    res.status(201).json({ success: true, message: 'Reseña creada', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creando reseña', error: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { restaurantID } = req.query;
    const filter = { isActive: true };
    if (restaurantID) filter.restaurantID = restaurantID;
    const reviews = await Review.find(filter).populate('restaurantID', 'name');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo reseñas', error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
    }
    res.status(200).json({ success: true, message: 'Reseña eliminada', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error eliminando reseña', error: error.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate('restaurantID', 'name');

    if (!review || !review.isActive) {
      return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
    }

    if (!canAccessReview(req, review)) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta reseña' });
    }

    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo reseña', error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);

    if (!review || !review.isActive) {
      return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
    }

    if (!canAccessReview(req, review)) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para editar esta reseña' });
    }

    if (rating !== undefined) {
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    return res.status(200).json({ success: true, message: 'Reseña actualizada', data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error actualizando reseña', error: error.message });
  }
};