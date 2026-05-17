import { useEffect } from 'react';
import { useReviewStore } from '../store/useReviewStore.js';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
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

export const ReviewsAdminTable = ({ restaurantID = null, platoID = null }) => {
  const reviews = useReviewStore((s) => s.reviews);
  const loading = useReviewStore((s) => s.loading);
  const averageRating = useReviewStore((s) => s.averageRating);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);
  const deleteReview = useReviewStore((s) => s.deleteReview);

  useEffect(() => {
    fetchReviews(restaurantID, platoID);
  }, [restaurantID, platoID, fetchReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.')) {
      return;
    }

    const result = await deleteReview(reviewId);

    if (result.success) {
      notyfSuccess('Reseña eliminada correctamente');
    } else {
      notyfError(result.error);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="p-6">
        <p className="text-[#2D4F4F]">Cargando reseñas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Reseñas</h1>
        <div className="flex items-center gap-4">
          <div className="bg-[#FDFBF7] border border-[#E8D4B8] rounded-lg px-4 py-3">
            <p className="text-sm text-gray-600">Calificación Promedio</p>
            <p className="text-2xl font-bold text-[#2D4F4F]">
              {averageRating.toFixed(1)} <span className="text-lg">/ 5.0</span>
            </p>
          </div>
          <div className="bg-[#FDFBF7] border border-[#E8D4B8] rounded-lg px-4 py-3">
            <p className="text-sm text-gray-600">Total de Reseñas</p>
            <p className="text-2xl font-bold text-[#2D4F4F]">{reviews.length}</p>
          </div>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg border border-[#E8D4B8]">
          <table className="w-full bg-white">
            <thead className="bg-[#2D4F4F] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Calificación</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Comentario</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr
                  key={review._id}
                  className={`border-t border-[#E8D4B8] hover:bg-[#FDFBF7] transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FDFBF7]/50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-[#2D4F4F]">
                    <div>
                      <p className="font-medium">
                        {review.userID?.full_name || 'Usuario desconocido'}
                      </p>
                      {review.userID?.email && (
                        <p className="text-xs text-gray-600">{review.userID.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="font-semibold text-[#2D4F4F]">{review.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#2D4F4F] max-w-xs truncate">
                    {review.comment}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="inline-flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 font-medium"
                      title="Eliminar reseña"
                    >
                      <svg
                        width="16"
                        height="16"
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
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#FDFBF7] border border-[#E8D4B8] rounded-lg p-8 text-center">
          <p className="text-gray-600 font-medium">No hay reseñas para mostrar</p>
          <p className="text-sm text-gray-500 mt-2">Las reseñas aparecerán aquí cuando los clientes las creen</p>
        </div>
      )}
    </div>
  );
};
