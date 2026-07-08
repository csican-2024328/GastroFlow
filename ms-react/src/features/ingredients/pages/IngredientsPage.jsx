import { useEffect, useMemo, useState } from 'react';
import { IngredientFilters } from '../components/IngredientFilters.jsx';
import { IngredientModal } from '../components/IngredientModal.jsx';
import { useIngredientStore } from '../store/useIngredientStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import '../../../styles/ingredients.css';
 
/* ── Helpers — INTACTOS ── */
const getRestaurantName = (restaurantId, restaurantOptions) => {
  const normalizedId = restaurantId?._id || restaurantId;
  const restaurant = restaurantOptions.find((item) => item._id === normalizedId);
  return restaurant?.name || restaurantId?.name || 'Sin restaurante';
};
 
const normalizeIngredientRestaurantId = (ingredient) => (
  ingredient?.restaurantId?._id ||
  ingredient?.restaurantId ||
  ingredient?.RestaurantId?._id ||
  ingredient?.RestaurantId ||
  ''
);
 
export const IngredientsPage = ({ hideRestaurantFilter = false, lockedRestaurantId = '' }) => {
  const [isModalOpen,         setIsModalOpen]         = useState(false);
  const [selectedIngredient,  setSelectedIngredient]  = useState(null);
  const [ingredientToDelete,  setIngredientToDelete]  = useState(null);
  const [searchTerm,          setSearchTerm]          = useState('');
 
  const ingredients            = useIngredientStore((s) => s.ingredients);
  const restaurantOptions      = useIngredientStore((s) => s.restaurantOptions);
  const loading                = useIngredientStore((s) => s.loading);
  const selectedRestaurantId   = useIngredientStore((s) => s.selectedRestaurantId);
  const fetchRestaurantOptions = useIngredientStore((s) => s.fetchRestaurantOptions);
  const fetchIngredients       = useIngredientStore((s) => s.fetchIngredients);
  const deleteIngredientAction = useIngredientStore((s) => s.deleteIngredientAction);
  const clearSelectedIngredient= useIngredientStore((s) => s.clearSelectedIngredient);
 
  /* ── Filtrado — INTACTO ── */
  const filteredIngredients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const scopedIngredients = lockedRestaurantId
      ? ingredients.filter((i) => normalizeIngredientRestaurantId(i).toString() === lockedRestaurantId.toString())
      : ingredients;
    if (!normalizedSearch) return scopedIngredients;
    return scopedIngredients.filter((i) => i.nombre?.toLowerCase().includes(normalizedSearch));
  }, [ingredients, lockedRestaurantId, searchTerm]);
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => {
    if (restaurantOptions.length === 0) fetchRestaurantOptions();
  }, [fetchRestaurantOptions, restaurantOptions.length]);
 
  useEffect(() => {
    fetchIngredients(lockedRestaurantId || selectedRestaurantId);
  }, [fetchIngredients, lockedRestaurantId, selectedRestaurantId]);
 
  /* ── Handlers — INTACTOS ── */
  const handleCreateIngredient  = () => { clearSelectedIngredient(); setSelectedIngredient(null); setIsModalOpen(true); };
  const handleEditIngredient    = (i) => { setSelectedIngredient(i); setIsModalOpen(true); };
  const handleCloseModal        = () => { setIsModalOpen(false); setSelectedIngredient(null); clearSelectedIngredient(); };
  const handleRequestDelete     = (i) => setIngredientToDelete(i);
  const handleCloseDeleteDialog = () => setIngredientToDelete(null);
 
  const handleConfirmDelete = async () => {
    if (!ingredientToDelete?._id) return;
    const result = await deleteIngredientAction(ingredientToDelete._id);
    if (result.success) { notyfSuccess('Ingrediente eliminado correctamente'); handleCloseDeleteDialog(); }
    else notyfError(result.error || 'Error al eliminar ingrediente');
  };
 
  if (loading && ingredients.length === 0) {
    return (
      <div className="ig-loading">
        <div className="ig-loading-spinner" />
        Cargando ingredientes...
      </div>
    );
  }
 
  /* Stats derivadas */
  const totalIngredients  = filteredIngredients.length;
  const lowStock          = filteredIngredients.filter((i) => (i.stock ?? 0) < 5).length;
  const totalRestaurants  = new Set(filteredIngredients.map((i) => normalizeIngredientRestaurantId(i)).filter(Boolean)).size;
 
  return (
    <div className="ig-root">
 
      {/* HEADER */}
      <div className="ig-header">
        <div>
          <div className="ig-header-badge">
            <i className="ti ti-carrot" aria-hidden="true" />
            Gestión de inventario
          </div>
          <h1 className="ig-header-title">Ingredientes</h1>
          <p className="ig-header-sub">Administra el inventario de ingredientes por sucursal.</p>
        </div>
        <button onClick={handleCreateIngredient} className="ig-btn-new">
          <i className="ti ti-plus" aria-hidden="true" />
          + Nuevo ingrediente
        </button>
      </div>
 
      {/* STATS */}
      <div className="ig-stats">
        <div className="ig-stat ig-stat--gold">
          <div className="ig-stat-top"><div className="ig-stat-icon"><i className="ti ti-carrot" aria-hidden="true" /></div></div>
          <div className="ig-stat-label">Total ingredientes</div>
          <div className="ig-stat-value">{totalIngredients}</div>
        </div>
        <div className="ig-stat ig-stat--green">
          <div className="ig-stat-top"><div className="ig-stat-icon ig-stat-icon--g"><i className="ti ti-check" aria-hidden="true" /></div></div>
          <div className="ig-stat-label">Stock suficiente</div>
          <div className="ig-stat-value ig-stat-value--green">{totalIngredients - lowStock}</div>
        </div>
        <div className="ig-stat">
          <div className="ig-stat-top"><div className="ig-stat-icon" style={{ background:'rgba(200,80,80,.10)', borderColor:'rgba(200,80,80,.2)' }}><i className="ti ti-alert-triangle" style={{ color:'var(--ig-red)' }} aria-hidden="true" /></div></div>
          <div className="ig-stat-label">Stock bajo (&lt;5)</div>
          <div className="ig-stat-value" style={{ color: lowStock > 0 ? 'var(--ig-red)' : 'var(--ig-text-primary)' }}>{lowStock}</div>
        </div>
        <div className="ig-stat ig-stat--blue">
          <div className="ig-stat-top"><div className="ig-stat-icon ig-stat-icon--b"><i className="ti ti-building-store" aria-hidden="true" /></div></div>
          <div className="ig-stat-label">Restaurantes</div>
          <div className="ig-stat-value ig-stat-value--blue">{totalRestaurants || restaurantOptions.length}</div>
        </div>
      </div>
 
      {/* FILTROS */}
      {!hideRestaurantFilter ? (
        <IngredientFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      ) : (
        <div className="ig-filters">
          <div className="ig-filter-group ig-filter-group--wide">
            <span className="ig-filter-label">Buscar por nombre</span>
            <div className="ig-filter-wrap">
              <i className="ti ti-search ig-filter-icon" aria-hidden="true" />
              <input
                type="text" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre..."
                className="ig-filter-input"
              />
            </div>
          </div>
          <div className="ig-filter-locked">
            <i className="ti ti-lock" aria-hidden="true" />
            Ingredientes restringidos al restaurante asignado
          </div>
        </div>
      )}
 
      {/* TABLA */}
      <div className="ig-section">
        <div className="ig-section-header">
          <span className="ig-section-title">Lista de ingredientes</span>
          <span className="ig-section-badge">{filteredIngredients.length} registros</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ig-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Nombre</th>
                <th style={{ width: '14%' }}>Stock</th>
                <th style={{ width: '16%' }}>Unidad de medida</th>
                <th style={{ width: '26%' }}>Restaurante</th>
                <th style={{ width: '16%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.length > 0 ? (
                filteredIngredients.map((ingredient, idx) => (
                  <tr key={ingredient._id} style={{ animationDelay: `${idx * 0.04}s` }}>
                    <td className="ig-td-main">{ingredient.nombre}</td>
                    <td>
                      <span className={`ig-stock-chip${(ingredient.stock ?? 0) < 5 ? ' ig-stock-chip--low' : (ingredient.stock ?? 0) >= 20 ? ' ig-stock-chip--ok' : ''}`}>
                        {ingredient.stock ?? 0}
                      </span>
                    </td>
                    <td><span className="ig-unit-badge">{ingredient.unidadMedida}</span></td>
                    <td>{getRestaurantName(ingredient.restaurantId, restaurantOptions)}</td>
                    <td>
                      <div className="ig-action-btns">
                        <button className="ig-action-btn ig-action-btn--edit" onClick={() => handleEditIngredient(ingredient)} title="Editar ingrediente" aria-label="Editar">
                          <i className="ti ti-edit" aria-hidden="true" />
                        </button>
                        <button className="ig-action-btn ig-action-btn--del" onClick={() => handleRequestDelete(ingredient)} title="Eliminar ingrediente" aria-label="Eliminar">
                          <i className="ti ti-trash" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="ig-empty">
                    <i className="ti ti-basket-off" aria-hidden="true" />
                    {searchTerm.trim() ? 'No hay ingredientes que coincidan con la búsqueda.' : 'No hay ingredientes registrados para este filtro.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* MODAL */}
      <IngredientModal
        open={isModalOpen}
        onClose={handleCloseModal}
        ingredient={selectedIngredient}
        lockedRestaurantId={lockedRestaurantId}
      />
 
      {/* CONFIRM DELETE DIALOG */}
      {ingredientToDelete && (
        <div className="ig-confirm-overlay">
          <div className="ig-confirm-box">
            <div className="ig-confirm-icon"><i className="ti ti-trash" aria-hidden="true" /></div>
            <h4 className="ig-confirm-title">Confirmar eliminación</h4>
            <p className="ig-confirm-msg">
              ¿Estás seguro de que deseas eliminar <strong style={{ color: 'var(--ig-text-primary)' }}>{ingredientToDelete.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="ig-confirm-actions">
              <button onClick={handleCloseDeleteDialog} className="ig-confirm-cancel">Cancelar</button>
              <button onClick={handleConfirmDelete} disabled={loading} className="ig-confirm-delete">
                <i className="ti ti-trash" aria-hidden="true" />
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
 
    </div>
  );
};
 