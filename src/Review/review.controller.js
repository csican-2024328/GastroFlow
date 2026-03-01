import Review from './review.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';

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