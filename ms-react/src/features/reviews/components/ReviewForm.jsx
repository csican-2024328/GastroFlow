import { useState } from 'react';
import { useReviewStore } from '../store/useReviewStore.js';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';

export const ReviewForm = ({ restaurantID, platoID, onReviewCreated }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReview = useReviewStore((s) => s.createReview);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      notyfError('Por favor, selecciona una calificación');
      return;
    }

    if (!comment.trim()) {
      notyfError('Por favor, escribe un comentario');
      return;
    }

    // Validar que restaurantID existe
    if (!restaurantID) {
      notyfError('Error: Restaurante no especificado');
      console.error('❌ restaurantID faltante:', { restaurantID, platoID });
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      rating,
      comment: comment.trim(),
      restaurantID, // ✅ Obligatorio
    };

    if (platoID) reviewData.platoID = platoID;

    console.log('📤 Enviando reseña:', reviewData);

    const result = await createReview(reviewData);

    if (result.success) {
      notyfSuccess('Reseña creada correctamente');
      setRating(0);
      setComment('');
      setHoverRating(0);
      if (onReviewCreated) {
        onReviewCreated(result.data);
      }
    } else {
      notyfError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#FDFBF7] border border-[#E8D4B8] rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-[#2D4F4F] mb-4">Deja tu Reseña</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#2D4F4F]">Calificación</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-all duration-200"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill={star <= (hoverRating || rating) ? '#2D4F4F' : 'none'}
                  stroke="#2D4F4F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:scale-110 transition-transform"
                >
                  <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2"></polygon>
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-[#2D4F4F]">
              Calificación: <span className="font-semibold">{rating} de 5 estrellas</span>
            </p>
          )}
        </div>

        {/* Comment Textarea */}
        <div className="space-y-2">
          <label htmlFor="comment" className="block text-sm font-medium text-[#2D4F4F]">
            Comentario
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia... (mínimo 10 caracteres)"
            maxLength="500"
            rows="4"
            className="w-full px-3 py-2 border border-[#E8D4B8] rounded-lg bg-white text-[#2D4F4F] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2D4F4F] focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-600">
            {comment.length} / 500 caracteres
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#2D4F4F] hover:bg-[#1a3535] shadow-[0_10px_22px_rgba(45,79,79,0.3)]'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
        </button>
      </form>
    </div>
  );
};
