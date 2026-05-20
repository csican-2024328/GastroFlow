import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '../store/useAssignmentStore.js';
import '../../../styles/assignments.css';
 
export const AssignmentsPage = () => {
  const { platformAdmins, restaurants, loading, fetchAllData, assignRestaurant } = useAssignmentStore();
  const [filter, setFilter] = useState('');
 
  useEffect(() => { fetchAllData(); }, []);
 
  /* ── Helpers — INTACTOS ── */
  const getAdminId        = (a) => a?.Id||a?.id||a?._id||a?.userId||'';
  const getAdminFirstName = (a) => a?.Name||a?.name||a?.firstName||a?.username||'';
  const getAdminLastName  = (a) => a?.Surname||a?.surname||a?.lastName||'';
  const getAdminEmail     = (a) => a?.Email||a?.email||a?.userEmail||'';
  const getRestaurantName = (r) => r?.name||r?.nombre||'';
  const getRestaurantCity = (r) => r?.city||r?.ciudad||'';
 
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState({});
  const [assigning, setAssigning] = useState({});
 
  useEffect(() => {
    const sel = {};
    platformAdmins.forEach(admin => {
      const id = getAdminId(admin);
      if (admin.RestaurantId) sel[id] = admin.RestaurantId;
    });
    setSelectedRestaurantIds(sel);
  }, [platformAdmins]);
 
  const handleRestaurantSelection = (adminId, restaurantId) =>
    setSelectedRestaurantIds(prev => ({ ...prev, [adminId]:restaurantId }));
 
  const handleAssign = async (adminId) => {
    const restaurantId = selectedRestaurantIds[adminId];
    if (!restaurantId) { toast.error('Selecciona un restaurante para asignar.'); return; }
    setAssigning(prev => ({ ...prev, [adminId]:true }));
    try {
      const result = await assignRestaurant(adminId, restaurantId);
      toast.success('Restaurante asignado correctamente.');
    } catch (err) { toast.error(err.response?.data?.message||err.message||'Error al asignar restaurante'); }
    finally { setAssigning(prev => ({ ...prev, [adminId]:false })); }
  };
 
  const assignments = platformAdmins.map(admin => ({
    admin,
    restaurant: restaurants.find(r => r._id===admin.RestaurantId||r._id===admin?.RestaurantId)||null,
  }));
 
  const filteredAssignments = assignments.filter(item => {
    const name = `${getAdminFirstName(item.admin)} ${getAdminLastName(item.admin)}`.trim().toLowerCase();
    const rest = getRestaurantName(item.restaurant).toLowerCase();
    const q    = filter.toLowerCase();
    return name.includes(q) || rest.includes(q);
  });
 
  const assignedCount = assignments.filter(i => i.restaurant).length;
 
  if (loading) {
    return (
      <div className="as-root">
        <div className="as-loading-wrap"><div className="as-spinner" />Cargando asignaciones...</div>
      </div>
    );
  }
 
  return (
    <div className="as-root">
 
      {/* HEADER */}
      <div className="as-header">
        <div className="as-header-left">
          <div className="as-header-badge"><i className="ti ti-link" aria-hidden="true" />Control de asignaciones</div>
          <h1 className="as-header-title">Asignaciones de Restaurantes</h1>
          <p className="as-header-sub">Control de administradores asignados a restaurantes</p>
        </div>
        <span className="as-header-stat">Total asignaciones: <strong style={{color:'var(--as-gold)'}}>{assignedCount}</strong></span>
      </div>
 
      {/* BUSCADOR */}
      <div className="as-search-wrap">
        <i className="ti ti-search as-search-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Buscar por nombre de admin o restaurante..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="as-search-input"
        />
      </div>
 
      {/* TABLA */}
      <div className="as-section">
        <div style={{overflowX:'auto'}}>
          <table className="as-table">
            <thead>
              <tr>
                <th style={{width:'28%'}}>Administrador</th>
                <th style={{width:'24%'}}>Email</th>
                <th style={{width:'34%'}}>Restaurante Asignado</th>
                <th style={{width:'14%'}}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr><td colSpan="4" style={{padding:0}}>
                  <div className="as-table-empty">
                    <i className="ti ti-link-off" aria-hidden="true" />
                    No se encontraron asignaciones
                  </div>
                </td></tr>
              ) : (
                filteredAssignments.map((item, idx) => {
                  const adminId = getAdminId(item.admin);
                  const initials = `${getAdminFirstName(item.admin)?.[0]||''}${getAdminLastName(item.admin)?.[0]||''}`.toUpperCase();
                  return (
                    <tr key={adminId||idx} style={{animationDelay:`${idx*.03}s`}}>
                      <td>
                        <div className="as-admin-cell">
                          <div className="as-avatar">{initials||'?'}</div>
                          <div>
                            <div className="as-admin-name">{getAdminFirstName(item.admin)||getAdminEmail(item.admin)||adminId} {getAdminLastName(item.admin)}</div>
                            <div className="as-admin-id">ID: {adminId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="as-admin-email">{getAdminEmail(item.admin)}</td>
                      <td>
                        {item.restaurant ? (
                          <>
                            <div className="as-restaurant-name">{getRestaurantName(item.restaurant)}</div>
                            <div className="as-restaurant-city">{getRestaurantCity(item.restaurant)}</div>
                          </>
                        ) : (
                          <div className="as-unassigned"><i className="ti ti-alert-circle" aria-hidden="true" />Sin asignar</div>
                        )}
                        <div className="as-inline-assign">
                          <select
                            value={selectedRestaurantIds[adminId]||''}
                            onChange={e => handleRestaurantSelection(adminId, e.target.value)}
                            className="as-inline-select"
                          >
                            <option value="">Seleccionar restaurante...</option>
                            {restaurants.map(r => (
                              <option key={r._id} value={r._id}>{r.name||r.nombre} — {r.city||r.ciudad}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAssign(adminId)}
                            disabled={assigning[adminId]}
                            className="as-assign-btn"
                          >
                            {assigning[adminId] ? 'Asignando...' : 'Asignar'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`as-chip ${item.restaurant?'as-chip--assigned':'as-chip--unassigned'}`}>
                          <i className={`ti ${item.restaurant?'ti-check':'ti-clock'}`} aria-hidden="true" />
                          {item.restaurant?'Asignado':'Sin asignar'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
 
    </div>
  );
};