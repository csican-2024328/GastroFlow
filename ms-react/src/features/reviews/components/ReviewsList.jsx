import { useEffect } from 'react';
import { useReviewStore } from '../store/useReviewStore.js';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? '#2D4F4F' : 'none'}
          stroke="#2D4F4F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2"></polygon>
        </svg>
      ))}
    </div>
  );
};

export const ReviewsList = ({ restaurantID = null, platoID = null, showDeleteButton = false, onReviewDeleted }) => {
  const reviews = useReviewStore((s) => s.reviews);
  const loading = useReviewStore((s) => s.loading);
  const averageRating = useReviewStore((s) => s.averageRating);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const deleteReview = useReviewStore((s) => s.deleteReview);

  useEffect(() => {
    fetchReviews(restaurantID, platoID);
  }, [restaurantID, platoID, fetchReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      return;
    }

    const result = await deleteReview(reviewId);

    if (result.success) {
      notyfSuccess('Reseña eliminada correctamente');
      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } else {
      notyfError(result.error);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-[#2D4F4F]">Cargando reseñas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Average Rating */}
      <div className="bg-[#FDFBF7] border border-[#E8D4B8] rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600 mb-2">Calificación Promedio</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#2D4F4F]">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <StarRating rating={Math.round(averageRating)} />
                <p className="text-xs text-gray-600 mt-1">
                  {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-[#E8D4B8] rounded-lg p-4 hover:border-[#2D4F4F] transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm font-semibold text-[#2D4F4F]">
                      {review.rating} de 5
                    </span>
                  </div>
                  {review.userID?.full_name && (
                    <p className="text-sm font-medium text-[#2D4F4F]">
                      {review.userID.full_name}
                    </p>
                  )}
                  {review.createdAt && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(review.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {showDeleteButton && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Eliminar reseña"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                )}
              </div>

              <p className="text-sm text-[#2D4F4F] leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay reseñas todavía.</p>
          <p className="text-sm text-gray-500">Sé el primero en dejar una reseña</p>
        </div>
      )}
    </div>
  );
};
