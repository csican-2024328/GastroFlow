import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useReviewStore } from '../store/useReviewStore.js';

const StarRating = ({ rating }) => (
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
        <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2" />
      </svg>
    ))}
  </div>
);

const ClientReviewsHistoryPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const reviews = useReviewStore((s) => s.reviews);
  const loading = useReviewStore((s) => s.loading);
  const averageRating = useReviewStore((s) => s.averageRating);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);

  const userID = useMemo(() => String(user?.id || user?._id || ''), [user]);

  useEffect(() => {
    if (!userID) return;
    fetchReviews({ userID });
  }, [userID, fetchReviews]);

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] fade-in">
      <header className="border-b border-[#E2D4B7] bg-[#F8F5F0]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">Mis Reseñas</h1>
            <p className="text-sm text-[#5A5146]">{user?.name}, aquí ves tu historial de reseñas</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              ← Menu Principal
            </button>
            <button
              onClick={() => navigate('/cliente/pedidos/mis')}
              className="rounded-full border border-[#C49A2B] bg-white px-4 py-2 text-sm font-semibold text-[#3D2C1E] hover:bg-[#E2D4B7]"
            >
              Ver mis pedidos
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {!userID ? (
          <div className="rounded-2xl border border-[#E2D4B7] bg-white p-10 text-center">
            <p className="font-semibold text-[#3D2C1E]">No se pudo identificar tu usuario</p>
          </div>
        ) : loading && reviews.length === 0 ? (
          <div className="py-14 text-center text-[#5A5146]">Cargando reseñas...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-[#E2D4B7] bg-white p-10 text-center">
            <p className="font-semibold text-[#3D2C1E]">Aún no has dejado reseñas</p>
            <button
              onClick={() => navigate('/cliente/pedidos/mis')}
              className="mt-4 rounded-xl bg-gradient-to-r from-[#C49A2B] to-[#E8B84B] px-4 py-2 font-bold text-white"
            >
              Ir a mis pedidos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E2D4B7] bg-white p-5 shadow-[0_8px_20px_rgba(61,44,30,0.08)]">
              <p className="text-sm text-[#5A5146]">Promedio de tus reseñas</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl font-bold text-[#2D4F4F]">{averageRating.toFixed(1)}</span>
                <StarRating rating={Math.round(averageRating)} />
                <span className="text-sm text-[#5A5146]">{reviews.length} reseñas</span>
              </div>
            </div>

            {reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-2xl border border-[#E2D4B7] bg-white p-6 shadow-[0_8px_20px_rgba(61,44,30,0.08)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="font-semibold text-[#2D4F4F]">{review.rating}/5</span>
                    </div>
                    <p className="text-sm text-[#5A5146]">
                      Restaurante: <span className="font-semibold text-[#3D2C1E]">{review.restaurantID?.name || 'No disponible'}</span>
                    </p>
                    {review.platoID?.nombre && (
                      <p className="text-sm text-[#5A5146]">
                        Plato: <span className="font-semibold text-[#3D2C1E]">{review.platoID.nombre}</span>
                      </p>
                    )}
                    <p className="text-sm text-[#3D2C1E] leading-relaxed">{review.comment}</p>
                  </div>

                  <div className="text-sm text-[#5A5146] md:text-right">
                    {review.createdAt && (
                      <p>
                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientReviewsHistoryPage;