import { useState, useEffect } from 'react';
import { getReviews } from '../../../shared/api/reviewService.js';
import '../../../styles/reviews.css';
 
const STAR_PATH = "M12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2";
 
const MiniStars = ({ rating }) => (
  <div className="rw-widget-stars">
    {[1,2,3,4,5].map(s => (
      <svg key={s} width="11" height="11" viewBox="0 0 24 24"
        fill={s<=Math.round(rating)?'var(--rw-star)':'var(--rw-star-empty)'}
        stroke={s<=Math.round(rating)?'var(--rw-star)':'rgba(200,140,40,.28)'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      ><polygon points={STAR_PATH} /></svg>
    ))}
  </div>
);
 
export const ReviewRatingWidget = ({ restaurantID = null, platoID = null, showCount = true }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount,   setReviewCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
 
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const params = {};
        if (restaurantID) params.restaurantID = restaurantID;
        if (platoID)      params.platoID      = platoID;
        const response = await getReviews(params);
        const reviews  = response.data.data || [];
        if (reviews.length > 0) {
          setAverageRating(parseFloat((reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)));
          setReviewCount(reviews.length);
        } else { setAverageRating(0); setReviewCount(0); }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    if (restaurantID || platoID) fetchRating();
  }, [restaurantID, platoID]);
 
  if (loading)                              return <span className="rw-widget-loading">...</span>;
  if (averageRating===0 && reviewCount===0) return <span className="rw-widget-none">Sin reseñas</span>;
 
  return (
    <div className="rw-widget">
      <MiniStars rating={averageRating} />
      <span className="rw-widget-score">{averageRating.toFixed(1)}</span>
      {showCount && <span className="rw-widget-count">({reviewCount} {reviewCount===1?'reseña':'reseñas'})</span>}
    </div>
  );
};
 
 
/* ═══════════════════════════════════════════════════════
   AdminReviewsPage.jsx — clases rw-*, lógica intacta
═══════════════════════════════════════════════════════ */
import { useParams } from 'react-router-dom';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { ReviewsAdminTable } from '../index.js';
 
export const AdminReviewsPage = () => {
  const { restaurantId: paramRestaurantId }     = useParams();
  const { restaurantId: scopeRestaurantId, isRestaurantAdmin } = useRestaurantScope();
  const effectiveRestaurantId = isRestaurantAdmin ? scopeRestaurantId : paramRestaurantId;
 
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const restaurants    = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);
 
  useEffect(() => { if (restaurants.length===0) fetchRestaurants(1,100); }, []);
  useEffect(() => {
    if (effectiveRestaurantId && restaurants.length>0) {
      setSelectedRestaurant(restaurants.find(r => r._id===effectiveRestaurantId)||null);
    }
  }, [effectiveRestaurantId, restaurants]);
 
  return (
    <>
      {selectedRestaurant && (
        <div className="rw-rest-banner" style={{margin:'0 0 4px',position:'relative',zIndex:1}}>
          <i className="ti ti-building-store" aria-hidden="true" />
          <div>
            <div className="rw-rest-banner-label">Restaurante Seleccionado</div>
            <div className="rw-rest-banner-name">{selectedRestaurant.name}</div>
          </div>
        </div>
      )}
      <ReviewsAdminTable
        restaurantID={effectiveRestaurantId}
        showRestaurant={!isRestaurantAdmin && !effectiveRestaurantId}
      />
    </>
  );
};
 
 
/* ═══════════════════════════════════════════════════════
   ClientReviewsHistoryPage.jsx — clases rw-client-*, lógica intacta
═══════════════════════════════════════════════════════ */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useReviewStore } from '../store/useReviewStore.js';
 
const STAR_PATH_H = "M12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26 12 2";
const StarsInline = ({ rating, size=16 }) => (
  <div className="rw-stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className="rw-star">
        <svg width={size} height={size} viewBox="0 0 24 24"
          fill={s<=rating?'var(--rw-star)':'var(--rw-star-empty)'}
          stroke={s<=rating?'var(--rw-star)':'rgba(200,140,40,.28)'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        ><polygon points={STAR_PATH_H} /></svg>
      </span>
    ))}
    <span className="rw-star-label">{rating}/5</span>
  </div>
);
 
const ClientReviewsHistoryPage = () => {
  const navigate      = useNavigate();
  const user          = useAuthStore((s) => s.user);
  const reviews       = useReviewStore((s) => s.reviews);
  const loading       = useReviewStore((s) => s.loading);
  const averageRating = useReviewStore((s) => s.averageRating);
  const fetchReviews  = useReviewStore((s) => s.fetchReviews);
  const userID        = useMemo(() => String(user?.id||user?._id||''), [user]);
 
  useEffect(() => { if (!userID) return; fetchReviews({ userID }); }, [userID, fetchReviews]);
 
  return (
    <div className="rw-client-root">
      <header className="rw-client-header">
        <div className="rw-client-header-inner">
          <div>
            <h1 className="rw-client-header-title">Mis Reseñas</h1>
            <p className="rw-client-header-sub">{user?.name}, aquí ves tu historial de reseñas</p>
          </div>
          <div className="rw-client-header-actions">
            <button onClick={() => navigate('/cliente')} className="rw-btn-back">
              <i className="ti ti-arrow-left" aria-hidden="true" />Menú Principal
            </button>
            <button onClick={() => navigate('/cliente/pedidos/mis')} className="rw-btn-back rw-btn-back--gold">
              <i className="ti ti-shopping-cart" aria-hidden="true" />Ver mis pedidos
            </button>
          </div>
        </div>
      </header>
 
      <main className="rw-client-main">
        {!userID ? (
          <div className="rw-empty"><i className="ti ti-user-off" aria-hidden="true" /><div className="rw-empty-title">No se pudo identificar tu usuario</div></div>
        ) : loading && reviews.length===0 ? (
          <div className="rw-loading"><div className="rw-spinner" />Cargando reseñas...</div>
        ) : reviews.length===0 ? (
          <div className="rw-empty">
            <i className="ti ti-star-off" aria-hidden="true" />
            <div className="rw-empty-title">Aún no has dejado reseñas</div>
            <button onClick={() => navigate('/cliente/pedidos/mis')} style={{marginTop:14,display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:9,background:'linear-gradient(135deg,var(--rw-gold),var(--rw-gold-dark))',border:'none',fontSize:12,fontWeight:500,color:'#0a0a08',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
              <i className="ti ti-shopping-cart" aria-hidden="true" />Ir a mis pedidos
            </button>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {/* Promedio */}
            <div className="rw-avg-card">
              <span className="rw-avg-num">{averageRating.toFixed(1)}</span>
              <div className="rw-avg-stars-wrap">
                <StarsInline rating={Math.round(averageRating)} />
                <span className="rw-avg-count">Promedio de tus {reviews.length} reseñas</span>
              </div>
            </div>
            {/* Lista */}
            {reviews.map((review, idx) => (
              <article key={review._id} className="rw-review-card" style={{animationDelay:`${idx*.04}s`}}>
                <div className="rw-review-header">
                  <div className="rw-review-header-left">
                    <StarsInline rating={review.rating} />
                    <div className="rw-review-restaurant">Restaurante: <strong>{review.restaurantID?.name||'No disponible'}</strong></div>
                    {review.platoID?.nombre && <div className="rw-review-plato">Plato: <strong>{review.platoID.nombre}</strong></div>}
                  </div>
                  {review.createdAt && (
                    <div className="rw-review-date">
                      {new Date(review.createdAt).toLocaleDateString('es-ES',{year:'numeric',month:'short',day:'numeric'})}
                    </div>
                  )}
                </div>
                <div className="rw-review-comment">{review.comment}</div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
export default ClientReviewsHistoryPage;
 
 
/* ═══════════════════════════════════════════════════════
   ClientDishReviewsPage.jsx — lógica intacta
═══════════════════════════════════════════════════════ */
import { ReviewForm, ReviewsList } from '../index.js';
 
export const ClientDishReviewsPage = () => {
  const { dishId, restaurantId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const handleReviewCreated = () => setRefreshKey(prev => prev+1);
 
  if (!dishId) {
    return <div className="rw-page-root" style={{padding:24}}><div className="rw-error-box">Error: No se especificó plato</div></div>;
  }
  return (
    <div className="rw-page-root">
      <header className="rw-page-header">
        <div className="rw-page-header-inner">
          <h1 className="rw-page-title">Reseñas del Plato</h1>
          <p className="rw-page-sub">Comparte tu opinión sobre este delicioso plato o lee las reseñas de otros clientes</p>
        </div>
      </header>
      <main className="rw-page-main">
        <ReviewForm platoID={dishId} restaurantID={restaurantId} onReviewCreated={handleReviewCreated} />
        <ReviewsList key={refreshKey} platoID={dishId} />
      </main>
    </div>
  );
};
 
 
/* ═══════════════════════════════════════════════════════
   ClientRestaurantReviewsPage.jsx — lógica intacta
═══════════════════════════════════════════════════════ */
export const ClientRestaurantReviewsPage = () => {
  const { restaurantId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const handleReviewCreated = () => setRefreshKey(prev => prev+1);
 
  if (!restaurantId) {
    return <div className="rw-page-root" style={{padding:24}}><div className="rw-error-box">Error: No se especificó restaurante</div></div>;
  }
  return (
    <div className="rw-page-root">
      <header className="rw-page-header">
        <div className="rw-page-header-inner">
          <h1 className="rw-page-title">Reseñas del Restaurante</h1>
          <p className="rw-page-sub">Comparte tu experiencia o lee lo que otros clientes dicen sobre este restaurante</p>
        </div>
      </header>
      <main className="rw-page-main">
        <ReviewForm restaurantID={restaurantId} onReviewCreated={handleReviewCreated} />
        <ReviewsList key={refreshKey} restaurantID={restaurantId} />
      </main>
    </div>
  );
};
 