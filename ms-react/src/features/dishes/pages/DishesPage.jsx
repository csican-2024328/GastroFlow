import { useEffect, useMemo, useState } from 'react';
import { DishFilters } from '../components/DishFilters.jsx';
import { DishFormModal } from '../components/DishFormModal.jsx';
import { useDishStore } from '../store/useDishStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import '../../../styles/dishes.css';
 
const getCategoryLabel = (cat) => ({ ENTRADA:'Entrada', FUERTE:'Plato Fuerte', POSTRE:'Postre', BEBIDA:'Bebida' }[cat] || cat);
const getRestaurantName = (restaurantId, restaurantOptions) => {
  const nid = restaurantId?._id || restaurantId;
  const r   = restaurantOptions.find((item) => item._id === nid);
  return r?.name || restaurantId?.name || 'Sin restaurante';
};
 
export const DishesPage = () => {
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [selectedDish,   setSelectedDish]   = useState(null);
  const [dishToDelete,   setDishToDelete]   = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');
 
  const dishes               = useDishStore((s) => s.dishes);
  const restaurantOptions    = useDishStore((s) => s.restaurantOptions);
  const loading              = useDishStore((s) => s.loading);
  const selectedRestaurantId = useDishStore((s) => s.selectedRestaurantId);
  const fetchRestaurantOptions = useDishStore((s) => s.fetchRestaurantOptions);
  const fetchDishes          = useDishStore((s) => s.fetchDishes);
  const deleteDishAction     = useDishStore((s) => s.deleteDishAction);
  const clearSelectedDish    = useDishStore((s) => s.clearSelectedDish);
  const { restaurantId }     = useRestaurantScope();
 
  /* ── Filtrado — INTACTO ── */
  const filteredDishes = useMemo(() => {
    const ns = searchTerm.trim().toLowerCase();
    return dishes.filter((dish) => {
      if (restaurantId) {
        const rid = dish.restaurantId?._id || dish.restaurantId;
        if (!rid || String(rid) !== String(restaurantId)) return false;
      }
      if (!ns) return true;
      return dish.nombre?.toLowerCase().includes(ns);
    });
  }, [dishes, searchTerm, restaurantId]);
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => { if (restaurantOptions.length === 0) fetchRestaurantOptions(); }, [fetchRestaurantOptions, restaurantOptions.length]);
  useEffect(() => { fetchDishes(restaurantId || selectedRestaurantId); }, [fetchDishes, selectedRestaurantId, restaurantId]);
 
  /* ── Handlers — INTACTOS ── */
  const handleCreateDish       = () => { clearSelectedDish(); setSelectedDish(null); setIsModalOpen(true); };
  const handleEditDish         = (d) => { setSelectedDish(d); setIsModalOpen(true); };
  const handleCloseModal       = () => { setIsModalOpen(false); setSelectedDish(null); clearSelectedDish(); };
  const handleRequestDelete    = (d) => setDishToDelete(d);
  const handleCloseDeleteDialog= () => setDishToDelete(null);
 
  const handleConfirmDelete = async () => {
    if (!dishToDelete?._id) return;
    const result = await deleteDishAction(dishToDelete._id);
    if (result.success) { notyfSuccess('Plato eliminado correctamente'); handleCloseDeleteDialog(); }
    else notyfError(result.error || 'Error al eliminar plato');
  };
 
  if (loading && dishes.length === 0) {
    return <div className="ds-loading"><div className="ds-loading-spinner" />Cargando platos...</div>;
  }
 
  return (
    <div className="ds-root">
 
      {/* HEADER */}
      <div className="ds-header">
        <div>
          <div className="ds-header-badge"><i className="ti ti-tools-kitchen-2" aria-hidden="true" />Gestión de platos</div>
          <h1 className="ds-header-title">Platos</h1>
          <p className="ds-header-sub">Gestiona el catálogo de platos y subida de imágenes.</p>
        </div>
        <button onClick={handleCreateDish} className="ds-btn-new">
          <i className="ti ti-plus" aria-hidden="true" />+ Nuevo plato
        </button>
      </div>
 
      {/* FILTROS */}
      <DishFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
 
      {/* GRID */}
      {filteredDishes.length > 0 ? (
        <div className="ds-grid">
          {filteredDishes.map((dish, idx) => (
            <div key={dish._id} className="ds-card" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="ds-card-img">
                {dish.foto
                  ? <img src={dish.foto} alt={dish.nombre} />
                  : <div className="ds-card-no-img"><i className="ti ti-photo-off" aria-hidden="true" />Sin foto</div>}
                {dish.categoria && (
                  <span className="ds-cat-badge">
                    <i className="ti ti-tag" style={{ fontSize: 9 }} aria-hidden="true" />
                    {getCategoryLabel(dish.categoria)}
                  </span>
                )}
              </div>
              <div className="ds-card-body">
                <h3 className="ds-card-name">{dish.nombre}</h3>
                {dish.descripcion && <p className="ds-card-desc">{dish.descripcion}</p>}
                <div className="ds-card-price">Q {dish.precio.toFixed(2)}</div>
                <div className="ds-card-meta">
                  <div className="ds-card-meta-row">
                    <i className="ti ti-building-store" aria-hidden="true" />
                    {getRestaurantName(dish.restaurantId, restaurantOptions)}
                  </div>
                  {dish.ingredientes?.length > 0 && (
                    <div className="ds-card-meta-row">
                      <span className="ds-count-pill">
                        <i className="ti ti-carrot" aria-hidden="true" />
                        {dish.ingredientes.length} ingrediente{dish.ingredientes.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="ds-card-actions">
                <button onClick={() => handleEditDish(dish)} className="ds-card-btn ds-card-btn--edit">
                  <i className="ti ti-edit" aria-hidden="true" />Editar
                </button>
                <button onClick={() => handleRequestDelete(dish)} className="ds-card-btn ds-card-btn--del">
                  <i className="ti ti-trash" aria-hidden="true" />Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ds-empty">
          <i className="ti ti-tools-kitchen-2" aria-hidden="true" />
          <p>{searchTerm.trim() ? 'No hay platos que coincidan con la búsqueda.' : 'No hay platos registrados para este filtro.'}</p>
        </div>
      )}
 
      {/* MODAL */}
      <DishFormModal open={isModalOpen} onClose={handleCloseModal} dish={selectedDish} />
 
      {/* CONFIRM DELETE */}
      {dishToDelete && (
        <div className="ds-confirm-overlay">
          <div className="ds-confirm-box">
            <div className="ds-confirm-icon"><i className="ti ti-trash" aria-hidden="true" /></div>
            <h4 className="ds-confirm-title">Confirmar eliminación</h4>
            <p className="ds-confirm-msg">¿Estás seguro de que deseas eliminar <strong style={{ color:'var(--ds-text-primary)' }}>{dishToDelete.nombre}</strong>?</p>
            <div className="ds-confirm-actions">
              <button onClick={handleCloseDeleteDialog} className="ds-confirm-cancel">Cancelar</button>
              <button onClick={handleConfirmDelete} disabled={loading} className="ds-confirm-delete">
                <i className="ti ti-trash" aria-hidden="true" />{loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
 
    </div>
  );
};
 