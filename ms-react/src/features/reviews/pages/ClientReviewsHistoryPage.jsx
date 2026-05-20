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
        fill={star <= rating ? 'var(--rw-star)' : 'none'}
        stroke={star <= rating ? 'var(--rw-star)' : 'rgba(200,140,40,.28)'}
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
    <div className="min-h-screen bg-[#0b0a08] text-[#f5ede0] fade-in">
      <header className="border-b border-[#2f2218] bg-[#111009]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#f5ede0]">Mis Reseñas</h1>
            <p className="text-sm text-[#b8a48a]">{user?.name}, aquí ves tu historial de reseñas</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2f2218] bg-[#0e0d0a] px-4 py-2 text-sm font-semibold text-[#f5ede0] hover:bg-[#1a1a14]"
            >
              ← Menu Principal
            </button>
            <button
              onClick={() => navigate('/cliente/pedidos/mis')}
              className="rounded-full border border-[#c88c28] bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-4 py-2 text-sm font-semibold text-[#0a0a08] hover:opacity-90"
            >
              Ver mis pedidos
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {!userID ? (
          <div className="rounded-2xl border border-[#2f2218] bg-[#111009] p-10 text-center shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
            <p className="font-semibold text-[#f5ede0]">No se pudo identificar tu usuario</p>
          </div>
        ) : loading && reviews.length === 0 ? (
          <div className="py-14 text-center text-[#b8a48a]">Cargando reseñas...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-[#2f2218] bg-[#111009] p-10 text-center shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
            <p className="font-semibold text-[#f5ede0]">Aún no has dejado reseñas</p>
            <button
              onClick={() => navigate('/cliente/pedidos/mis')}
              className="mt-4 rounded-xl bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-4 py-2 font-bold text-[#0a0a08]"
            >
              Ir a mis pedidos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#2f2218] bg-[#111009] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
              <p className="text-sm text-[#b8a48a]">Promedio de tus reseñas</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl font-bold text-[#c88c28]">{averageRating.toFixed(1)}</span>
                <StarRating rating={Math.round(averageRating)} />
                <span className="text-sm text-[#b8a48a]">{reviews.length} reseñas</span>
              </div>
            </div>

            {reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-2xl border border-[#2f2218] bg-[#111009] p-6 shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="font-semibold text-[#c88c28]">{review.rating}/5</span>
                    </div>
                    <p className="text-sm text-[#b8a48a]">
                      Restaurante: <span className="font-semibold text-[#f5ede0]">{review.restaurantID?.name || 'No disponible'}</span>
                    </p>
                    {review.platoID?.nombre && (
                      <p className="text-sm text-[#b8a48a]">
                        Plato: <span className="font-semibold text-[#f5ede0]">{review.platoID.nombre}</span>
                      </p>
                    )}
                    <p className="text-sm text-[#f5ede0] leading-relaxed">{review.comment}</p>
                  </div>

                  <div className="text-sm text-[#b8a48a] md:text-right">
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