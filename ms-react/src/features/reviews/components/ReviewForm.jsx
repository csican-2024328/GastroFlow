import { useState } from 'react';
import { useReviewStore } from '../store/useReviewStore.js';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';
import '../../../styles/reviews.css';
 
const STAR_PATH = "M12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2";
 
export const ReviewForm = ({ restaurantID, platoID, onReviewCreated }) => {
  const [rating,      setRating]      = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment,     setComment]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createReview = useReviewStore((s) => s.createReview);
 
  const LABELS = ['','Muy malo','Regular','Bueno','Muy bueno','Excelente'];
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0)        { notyfError('Por favor, selecciona una calificación'); return; }
    if (!comment.trim())     { notyfError('Por favor, escribe un comentario'); return; }
    if (!restaurantID)       { notyfError('Error: Restaurante no especificado'); return; }
 
    setIsSubmitting(true);
    const reviewData = { rating, comment: comment.trim(), restaurantID };
    if (platoID) reviewData.platoID = platoID;
 
    const result = await createReview(reviewData);
    if (result.success) {
      notyfSuccess('Reseña creada correctamente');
      setRating(0); setComment(''); setHoverRating(0);
      if (onReviewCreated) onReviewCreated(result.data);
    } else { notyfError(result.error); }
    setIsSubmitting(false);
  };
 
  const display = hoverRating || rating;
 
  return (
    <div className="rw-form-card">
      <div className="rw-form-title">Deja tu Reseña</div>
      <form onSubmit={handleSubmit} className="rw-form">
 
        {/* Estrellas */}
        <div className="rw-form-field">
          <span className="rw-form-label">Calificación</span>
          <div className="rw-stars" style={{gap:6}}>
            {[1,2,3,4,5].map(star => (
              <span key={star} className="rw-star rw-star-interactive"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <svg width="30" height="30" viewBox="0 0 26 26"
                  fill={star<=display ? '#c88c28' : 'rgba(200,140,40,0.08)'}
                  stroke={star<=display ? '#c88c28' : 'rgba(200,140,40,.28)'}
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d={STAR_PATH} />
                </svg>
              </span>
            ))}
          </div>
          {display > 0 && <div className="rw-star-feedback">{display} de 5 — {LABELS[display]}</div>}
        </div>
 
        {/* Comentario */}
        <div className="rw-form-field">
          <label htmlFor="rw-comment" className="rw-form-label">Comentario</label>
          <textarea
            id="rw-comment"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Comparte tu experiencia... (mínimo 10 caracteres)"
            maxLength={500}
            rows={4}
            className="rw-form-textarea"
          />
          <span className="rw-char-count">{comment.length} / 500</span>
        </div>
 
        <button type="submit" disabled={isSubmitting} className="rw-submit-btn">
          {isSubmitting
            ? <><span className="rw-submit-spinner" />Enviando...</>
            : <><i className="ti ti-send" aria-hidden="true" />Enviar Reseña</>}
        </button>
      </form>
    </div>
  );
};
 
 
/* ═══════════════════════════════════════════
   ReviewsList.jsx — clases rw-*, lógica intacta
═══════════════════════════════════════════ */
import { useEffect } from 'react';
 
const STAR_PATH_SM = "M12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2";
 
const StarsRow = ({ rating, size = 14 }) => (
  <div className="rw-stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className="rw-star">
        <svg width={size} height={size} viewBox="0 0 26 26"
          fill={s<=rating?'var(--rw-star)':'var(--rw-star-empty)'}
          stroke={s<=rating?'var(--rw-star)':'rgba(200,140,40,.3)'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        ><path d={STAR_PATH_SM} /></svg>
      </span>
    ))}
    <span className="rw-star-label">{rating}/5</span>
  </div>
);
 
export const ReviewsList = ({ restaurantID = null, platoID = null, showDeleteButton = false, onReviewDeleted }) => {
  const reviews       = useReviewStore((s) => s.reviews);
  const loading       = useReviewStore((s) => s.loading);
  const averageRating = useReviewStore((s) => s.averageRating);
  const fetchReviews  = useReviewStore((s) => s.fetchReviews);
  const deleteReview  = useReviewStore((s) => s.deleteReview);
 
  useEffect(() => { fetchReviews(restaurantID, platoID); }, [restaurantID, platoID, fetchReviews]);
 
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reseña?')) return;
    const result = await deleteReview(reviewId);
    if (result.success) { notyfSuccess('Reseña eliminada correctamente'); if (onReviewDeleted) onReviewDeleted(); }
    else notyfError(result.error);
  };
 
  if (loading && reviews.length === 0) {
    return <div className="rw-loading"><div className="rw-spinner" />Cargando reseñas...</div>;
  }
 
  return (
    <div>
      {/* Promedio */}
      <div className="rw-avg-card">
        <span className="rw-avg-num">{averageRating.toFixed(1)}</span>
        <div className="rw-avg-stars-wrap">
          <StarsRow rating={Math.round(averageRating)} size={16} />
          <span className="rw-avg-count">{reviews.length} {reviews.length===1?'reseña':'reseñas'}</span>
        </div>
      </div>
 
      {reviews.length > 0 ? (
        <div className="rw-list">
          {reviews.map((review, idx) => (
            <div key={review._id} className="rw-review-card" style={{animationDelay:`${idx*.04}s`}}>
              <div className="rw-review-header">
                <div className="rw-review-header-left">
                  <StarsRow rating={review.rating} size={14} />
                  {review.userID?.full_name && <div className="rw-review-user">{review.userID.full_name}</div>}
                  {review.createdAt && (
                    <div className="rw-review-date">{new Date(review.createdAt).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'})}</div>
                  )}
                </div>
                {showDeleteButton && (
                  <button onClick={() => handleDeleteReview(review._id)} className="rw-del-icon-btn" title="Eliminar reseña">
                    <i className="ti ti-trash" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="rw-review-comment">{review.comment}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rw-empty" style={{marginTop:10}}>
          <i className="ti ti-message-off" aria-hidden="true" />
          <div className="rw-empty-title">No hay reseñas todavía.</div>
          <div className="rw-empty-sub">Sé el primero en dejar una reseña</div>
        </div>
      )}
    </div>
  );
};