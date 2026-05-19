import { useEffect, useMemo, useRef, useState } from 'react';
import { useTableStore } from '../store/useTableStore.js';
import { TableFilters } from '../components/TableFilters.jsx';
import { TableModal } from '../components/TableModal.jsx';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import '../../../styles/tables-page.css';
 
export const TablesPage = () => {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [searchTerm, setSearchTerm]     = useState('');
 
  const hasMountedRef          = useRef(false);
  const skipNextPageFetchRef   = useRef(false);
  const currentPageRef         = useRef(currentPage);
 
  const restaurantOptions      = useTableStore((s) => s.restaurantOptions);
  const fetchRestaurantOptions = useTableStore((s) => s.fetchRestaurantOptions);
  const selectedRestaurantId   = useTableStore((s) => s.selectedRestaurantId);
  const mesas                  = useTableStore((s) => s.mesas);
  const loading                = useTableStore((s) => s.loading);
  const pagination             = useTableStore((s) => s.pagination);
  const fetchMesas             = useTableStore((s) => s.fetchMesas);
  const deleteMesaAction       = useTableStore((s) => s.deleteMesaAction);
  const clearSelectedMesa      = useTableStore((s) => s.clearSelectedMesa);
 
  const { restaurantId } = useRestaurantScope();
 
  /* ── Filtrado — INTACTO ── */
  const filteredMesas = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return mesas
      .filter((mesa) => {
        if (restaurantId) {
          const rid = mesa.restaurantID?._id || mesa.restaurantID;
          if (!rid) return false;
          if (String(rid) !== String(restaurantId)) return false;
        }
        return true;
      })
      .filter((mesa) => {
        if (!normalizedSearch) return true;
        const ubicacion     = mesa.ubicacion?.toLowerCase() || '';
        const numero        = String(mesa.numero ?? '').toLowerCase();
        const restaurantName = mesa.restaurantID?.name?.toLowerCase() || '';
        return ubicacion.includes(normalizedSearch)
          || numero.includes(normalizedSearch)
          || restaurantName.includes(normalizedSearch);
      });
  }, [mesas, searchTerm, restaurantId]);
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => {
    if (restaurantOptions.length === 0) fetchRestaurantOptions();
  }, [fetchRestaurantOptions, restaurantOptions.length]);
 
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
 
  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    if (currentPageRef.current !== 1) { skipNextPageFetchRef.current = true; setCurrentPage(1); }
    fetchMesas(1, 10, restaurantId || selectedRestaurantId);
  }, [fetchMesas, selectedRestaurantId]);
 
  useEffect(() => {
    if (skipNextPageFetchRef.current) { skipNextPageFetchRef.current = false; return; }
    fetchMesas(currentPage, 10, restaurantId || selectedRestaurantId);
  }, [currentPage, fetchMesas, selectedRestaurantId]);
 
  /* ── Handlers — INTACTOS ── */
  const handleCreateMesa = () => { clearSelectedMesa(); setSelectedMesa(null); setIsModalOpen(true); };
  const handleEditMesa   = (mesa) => { setSelectedMesa(mesa); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedMesa(null); clearSelectedMesa(); };
 
  const handleDeleteMesa = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta mesa?')) return;
    const result = await deleteMesaAction(id);
    if (result.success) notyfSuccess('Mesa eliminada correctamente');
    else notyfError(result.error || 'Error al eliminar la mesa');
  };
 
  const getRestaurantName = (restaurantID) => {
    const restaurant = restaurantOptions.find((item) => item._id === restaurantID || item._id === restaurantID?._id);
    return restaurant?.name || restaurantID?.name || 'Sin restaurante';
  };
 
  /* ── Estado de carga ── */
  if (loading && mesas.length === 0) {
    return (
      <div className="tp-loading">
        <div className="tp-loading-spinner" />
        Cargando mesas...
      </div>
    );
  }
 
  /* ── RENDER ── */
  return (
    <div className="tp-root">
 
      {/* HEADER */}
      <div className="tp-header">
        <div>
          <div className="tp-header-badge">
            <i className="ti ti-armchair" aria-hidden="true" />
            Gestión de mesas
          </div>
          <h1 className="tp-header-title">Mesas</h1>
          <p className="tp-header-sub">Administra las mesas por sucursal.</p>
        </div>
        <button onClick={handleCreateMesa} className="tp-btn-new">
          <i className="ti ti-plus" aria-hidden="true" />
          + Nueva mesa
        </button>
      </div>
 
      {/* STATS */}
      <div className="tp-stats">
        <div className="tp-stat tp-stat--gold">
          <div className="tp-stat-top">
            <div className="tp-stat-icon"><i className="ti ti-armchair" aria-hidden="true" /></div>
          </div>
          <div className="tp-stat-label">Total mesas</div>
          <div className="tp-stat-value">{mesas.length}</div>
        </div>
        <div className="tp-stat tp-stat--green">
          <div className="tp-stat-top">
            <div className="tp-stat-icon tp-stat-icon--g"><i className="ti ti-check" aria-hidden="true" /></div>
          </div>
          <div className="tp-stat-label">Activas</div>
          <div className="tp-stat-value tp-stat-value--green">
            {mesas.filter((m) => m.isActive !== false).length}
          </div>
        </div>
        <div className="tp-stat tp-stat--red">
          <div className="tp-stat-top">
            <div className="tp-stat-icon tp-stat-icon--r"><i className="ti ti-x" aria-hidden="true" /></div>
          </div>
          <div className="tp-stat-label">Inactivas</div>
          <div className="tp-stat-value tp-stat-value--red">
            {mesas.filter((m) => m.isActive === false).length}
          </div>
        </div>
        <div className="tp-stat">
          <div className="tp-stat-top">
            <div className="tp-stat-icon"><i className="ti ti-building-store" aria-hidden="true" /></div>
          </div>
          <div className="tp-stat-label">Restaurantes</div>
          <div className="tp-stat-value tp-stat-value--gold">{restaurantOptions.length}</div>
        </div>
      </div>
 
      {/* FILTROS */}
      <TableFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
 
      {/* TABLA */}
      <div className="tp-section">
        <div className="tp-section-header">
          <span className="tp-section-title">Lista de mesas</span>
          <span className="tp-section-badge">{filteredMesas.length} registros</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tp-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Identificador</th>
                <th style={{ width: '10%' }}>Número</th>
                <th style={{ width: '12%' }}>Capacidad</th>
                <th style={{ width: '26%' }}>Restaurante</th>
                <th style={{ width: '14%' }}>Estado</th>
                <th style={{ width: '16%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMesas.length > 0 ? (
                filteredMesas.map((mesa, idx) => (
                  <tr key={mesa._id} style={{ animationDelay: `${idx * 0.04}s` }}>
                    <td className="tp-td-main">{mesa.ubicacion}</td>
                    <td className="tp-td-gold">{mesa.numero}</td>
                    <td>
                      <i className="ti ti-users" style={{ fontSize: 12, verticalAlign: -2, marginRight: 4, color: 'rgba(200,140,40,.45)' }} aria-hidden="true" />
                      {mesa.capacidad}
                    </td>
                    <td>{getRestaurantName(mesa.restaurantID)}</td>
                    <td>
                      <span className={`tp-badge ${mesa.isActive !== false ? 'tp-badge--active' : 'tp-badge--inactive'}`}>
                        <i className={`ti ${mesa.isActive !== false ? 'ti-check' : 'ti-x'}`} style={{ fontSize: 9 }} aria-hidden="true" />
                        {mesa.isActive !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div className="tp-action-btns">
                        <button
                          className="tp-action-btn tp-action-btn--edit"
                          onClick={() => handleEditMesa(mesa)}
                          title="Editar mesa"
                          aria-label="Editar mesa"
                        >
                          <i className="ti ti-edit" aria-hidden="true" />
                        </button>
                        <button
                          className="tp-action-btn tp-action-btn--del"
                          onClick={() => handleDeleteMesa(mesa._id)}
                          title="Eliminar mesa"
                          aria-label="Eliminar mesa"
                        >
                          <i className="ti ti-trash" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="tp-empty">
                    <i className="ti ti-armchair-off" aria-hidden="true" />
                    {searchTerm.trim()
                      ? 'No hay mesas que coincidan con la búsqueda.'
                      : 'No hay mesas registradas para este filtro.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* PAGINACIÓN */}
      {pagination.totalPages > 1 && (
        <div className="tp-pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`tp-page-btn${page === currentPage ? ' tp-page-btn--active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
 
      {/* MODAL */}
      <TableModal open={isModalOpen} onClose={handleCloseModal} mesa={selectedMesa} />
    </div>
  );
};
 