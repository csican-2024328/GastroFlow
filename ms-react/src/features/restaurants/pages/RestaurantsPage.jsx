import { useEffect, useState, useRef } from 'react';
import { useRestaurantStore } from '../store/useRestaurantStore.js';
import { RestaurantModal } from '../components/RestaurantModal.jsx';
import { notyfSuccess, notyfError } from '../../../shared/utils/notyf.js';
import '../../../styles/restaurant.css';
 
export const RestaurantsPage = () => {
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [currentPage, setCurrentPage]           = useState(1);
  const componentMountedRef                     = useRef(false);
 
  const restaurants         = useRestaurantStore((s) => s.restaurants);
  const loading             = useRestaurantStore((s) => s.loading);
  const pagination          = useRestaurantStore((s) => s.pagination);
  const fetchRestaurants    = useRestaurantStore((s) => s.fetchRestaurants);
  const deleteRestaurantAction = useRestaurantStore((s) => s.deleteRestaurantAction);
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => {
    console.log('🔄 [RESTAURANTES PAGE] Componente montado, refrescando datos...');
    fetchRestaurants(1, 10);
    componentMountedRef.current = true;
    return () => { console.log('👋 [RESTAURANTES PAGE] Componente desmontado'); };
  }, []);
 
  useEffect(() => {
    if (componentMountedRef.current) {
      console.log('📄 [RESTAURANTES PAGE] Página cambiada a:', currentPage);
      fetchRestaurants(currentPage, 10);
    }
  }, [currentPage, fetchRestaurants]);
 
  /* ── Handlers — INTACTOS ── */
  const handleCreateRestaurant  = () => { setSelectedRestaurant(null); setIsModalOpen(true); };
  const handleEditRestaurant    = (r) => { setSelectedRestaurant(r); setIsModalOpen(true); };
  const handleCloseModal        = () => { setIsModalOpen(false); setSelectedRestaurant(null); };
 
  const handleDeleteRestaurant = async (id) => {
    // open confirm dialog instead of using native confirm
    setPendingDeleteId(id);
    setShowConfirm(true);
  };

  // Confirmation modal state and handlers
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return setShowConfirm(false);
    setShowConfirm(false);
    const result = await deleteRestaurantAction(pendingDeleteId);
    setPendingDeleteId(null);
    if (result.success) notyfSuccess('Restaurante eliminado correctamente');
    else notyfError(result.error || 'Error al eliminar restaurante');
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
    setShowConfirm(false);
  };
 
  /* ── Loading ── */
  if (loading && restaurants.length === 0) {
    return (
      <div className="rp-loading">
        <div className="rp-loading-spinner" />
        Cargando restaurantes...
      </div>
    );
  }
 
  return (
    <div className="rp-root">
 
      {/* HEADER */}
      <div className="rp-header">
        <div>
          <div className="rp-header-badge">
            <i className="ti ti-building-store" aria-hidden="true" />
            Gestión de restaurantes
          </div>
          <h1 className="rp-header-title">Restaurantes</h1>
          <p className="rp-header-sub">Administra todos los locales de la plataforma.</p>
        </div>
        <button onClick={handleCreateRestaurant} className="rp-btn-new">
          <i className="ti ti-plus" aria-hidden="true" />
          + Nuevo Restaurante
        </button>
      </div>
 
      {/* GRID DE CARDS */}
      {restaurants.length > 0 ? (
        <div className="rp-grid">
          {restaurants.map((restaurant, idx) => (
            <div
              key={restaurant._id}
              className="rp-card"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Imagen */}
              <div className="rp-card-img">
                {restaurant.photos && restaurant.photos.length > 0 ? (
                  <img src={restaurant.photos[0]} alt={restaurant.name} />
                ) : (
                  <div className="rp-card-no-img">
                    <i className="ti ti-photo-off" aria-hidden="true" />
                    Sin imagen
                  </div>
                )}
                <span className={`rp-status-badge ${restaurant.isActive ? 'rp-status-badge--active' : 'rp-status-badge--inactive'}`}>
                  <i className={`ti ${restaurant.isActive ? 'ti-check' : 'ti-x'}`} aria-hidden="true" />
                  {restaurant.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
 
              {/* Cuerpo */}
              <div className="rp-card-body">
                <h3 className="rp-card-name">{restaurant.name}</h3>
 
                {/* Pills */}
                <div className="rp-pills">
                  {restaurant.category && (
                    <span className="rp-pill">
                      <i className="ti ti-tools-kitchen-2" aria-hidden="true" />
                      {restaurant.category}
                    </span>
                  )}
                  {restaurant.openingHours && (
                    <span className="rp-pill">
                      <i className="ti ti-clock" aria-hidden="true" />
                      {restaurant.openingHours}
                    </span>
                  )}
                  {restaurant.averagePrice && (
                    <span className="rp-pill">
                      <i className="ti ti-currency-dollar" aria-hidden="true" />
                      Q{restaurant.averagePrice.toFixed(2)}
                    </span>
                  )}
                </div>
 
                {/* Info */}
                <div className="rp-card-info">
                  <div className="rp-info-row">
                    <i className="ti ti-map-pin" aria-hidden="true" />
                    <span className="rp-info-label">Dirección</span>
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="rp-info-row">
                    <i className="ti ti-building" aria-hidden="true" />
                    <span className="rp-info-label">Ciudad</span>
                    <span>{restaurant.city}</span>
                  </div>
                  <div className="rp-info-row">
                    <i className="ti ti-phone" aria-hidden="true" />
                    <span className="rp-info-label">Teléfono</span>
                    <span>{restaurant.phone}</span>
                  </div>
                  <div className="rp-info-row">
                    <i className="ti ti-mail" aria-hidden="true" />
                    <span className="rp-info-label">Email</span>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{restaurant.email}</span>
                  </div>
                  {restaurant.aforoMaximo && (
                    <div className="rp-info-row">
                      <i className="ti ti-users" aria-hidden="true" />
                      <span className="rp-info-label">Aforo máx.</span>
                      <span>{restaurant.aforoMaximo}</span>
                    </div>
                  )}
                </div>
 
                {/* Descripción */}
                {restaurant.description && (
                  <p className="rp-card-desc">{restaurant.description}</p>
                )}
 
                {/* Acciones */}
                <div className="rp-card-actions">
                  <button onClick={() => handleEditRestaurant(restaurant)} className="rp-card-btn rp-card-btn--edit">
                    <i className="ti ti-edit" aria-hidden="true" />
                    Editar
                  </button>
                  <button onClick={() => handleDeleteRestaurant(restaurant._id)} className="rp-card-btn rp-card-btn--delete">
                    <i className="ti ti-trash" aria-hidden="true" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rp-empty">
          <i className="ti ti-building-store" aria-hidden="true" />
          <p className="rp-empty-title">No hay restaurantes registrados</p>
          <button onClick={handleCreateRestaurant} className="rp-btn-empty">
            <i className="ti ti-plus" aria-hidden="true" />
            Crear primer restaurante
          </button>
        </div>
      )}
 
      {/* PAGINACIÓN */}
      {pagination.totalPages > 1 && (
        <div className="rp-pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rp-page-btn${page === currentPage ? ' rp-page-btn--active' : ''}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
 
      {/* MODAL */}
      <RestaurantModal isOpen={isModalOpen} onClose={handleCloseModal} restaurant={selectedRestaurant} />
      {/* Custom confirmation modal (replaces native confirm) */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#2f2218] bg-[#111009] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#f5ede0]">Confirmar eliminación</h3>
            <p className="mt-2 text-sm text-[#b8a48a]">¿Estás seguro de que deseas eliminar este restaurante? Esta acción no se puede deshacer.</p>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={handleCancelDelete} className="rounded-xl border border-[#2f2218] px-4 py-2 text-sm font-semibold text-[#c88c28] hover:bg-[#1a1a14]">
                Cancelar
              </button>
              <button onClick={handleConfirmDelete} className="rounded-xl bg-gradient-to-r from-[#c87a55] to-[#c49a2b] px-4 py-2 text-sm font-semibold text-[#0a0a08]">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 