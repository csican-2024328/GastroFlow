import { useEffect } from 'react';
import { useReviewStore } from '../store/useReviewStore.js';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';
import '../../../styles/reviews.css';
 
const STAR_PATH = "M12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2";
 
const StarRating = ({ rating, size=13 }) => (
  <div className="rw-stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className="rw-star">
        <svg width={size} height={size} viewBox="0 0 24 24"
          fill={s<=rating?'var(--rw-star)':'var(--rw-star-empty)'}
          stroke={s<=rating?'var(--rw-star)':'rgba(200,140,40,.3)'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        ><polygon points={STAR_PATH} /></svg>
      </span>
    ))}
    <span className="rw-star-label">{rating}/5</span>
  </div>
);
 
export const ReviewsAdminTable = ({ restaurantID = null, platoID = null, showRestaurant = false }) => {
  const reviews       = useReviewStore((s) => s.reviews);
  const loading       = useReviewStore((s) => s.loading);
  const averageRating = useReviewStore((s) => s.averageRating);
  const fetchReviews  = useReviewStore((s) => s.fetchReviews);
  const deleteReview  = useReviewStore((s) => s.deleteReview);
 
  useEffect(() => { fetchReviews(restaurantID, platoID); }, [restaurantID, platoID, fetchReviews]);
 
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    const result = await deleteReview(reviewId);
    if (result.success) notyfSuccess('Reseña eliminada correctamente');
    else notyfError(result.error);
  };
 
  if (loading && reviews.length === 0) {
    return <div className="rw-loading"><div className="rw-spinner" />Cargando reseñas...</div>;
  }
 
  return (
    <div className="rw-root">
 
      {/* Header */}
      <div className="rw-header">
        <div>
          <div className="rw-header-badge"><i className="ti ti-star" aria-hidden="true" />Gestión de reseñas</div>
          <h1 className="rw-header-title">Gestión de Reseñas</h1>
        </div>
        <div className="rw-header-stats">
          <div className="rw-stat">
            <div className="rw-stat-label">Calificación Promedio</div>
            <div className="rw-stat-value">{averageRating.toFixed(1)} <span style={{fontSize:13,color:'var(--rw-text-tertiary)'}}>/ 5.0</span></div>
          </div>
          <div className="rw-stat">
            <div className="rw-stat-label">Total de Reseñas</div>
            <div className="rw-stat-value">{reviews.length}</div>
          </div>
        </div>
      </div>
 
      {/* Tabla */}
      {reviews.length > 0 ? (
        <div className="rw-section">
          <div style={{overflowX:'auto'}}>
            <table className="rw-table">
              <thead>
                <tr>
                  <th style={{width:'18%'}}>Usuario</th>
                  {showRestaurant && <th style={{width:'14%'}}>Restaurante</th>}
                  <th style={{width:'16%'}}>Calificación</th>
                  <th style={{width:'28%'}}>Comentario</th>
                  <th style={{width:'14%'}}>Fecha</th>
                  <th style={{width:'10%'}} className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, idx) => (
                  <tr key={review._id} style={{animationDelay:`${idx*.03}s`}}>
                    <td>
                      <div className="rw-td-main">{review.userID?.full_name||review.userID||'Usuario desconocido'}</div>
                      {review.userID?.email && <div className="rw-td-sub">{review.userID.email}</div>}
                    </td>
                    {showRestaurant && <td className="rw-td-main">{review.restaurantID?.name||'Desconocido'}</td>}
                    <td><StarRating rating={review.rating} /></td>
                    <td className="rw-td-comment">{review.comment}</td>
                    <td style={{fontSize:11,color:'rgba(245,237,224,.3)'}}>
                      {new Date(review.createdAt).toLocaleString('es-ES',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </td>
                    <td className="rw-td-center">
                      <button onClick={() => handleDeleteReview(review._id)} className="rw-del-btn" title="Eliminar reseña">
                        <i className="ti ti-trash" aria-hidden="true" />Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rw-empty">
          <i className="ti ti-message-off" aria-hidden="true" />
          <div className="rw-empty-title">No hay reseñas para mostrar</div>
          <div className="rw-empty-sub">Las reseñas aparecerán aquí cuando los clientes las creen</div>
        </div>
      )}
    </div>
  );
};