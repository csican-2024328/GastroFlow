import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import { getOrders, updateOrderStatus, cancelOrder } from '../../../shared/api/orderService.js';
import { getRestaurants } from '../../../shared/api/restaurantService.js';
import '../../../styles/orders.css';
 
/* ── Helpers — INTACTOS ── */
const VALID_TRANSITIONS = {
  PENDIENTE:    ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: (tipo) => tipo === 'A_DOMICILIO' ? ['ENTREGADO_AL_REPARTIDOR','CANCELADO'] : ['LISTO','CANCELADO'],
  LISTO:                  [],
  ENTREGADO_AL_REPARTIDOR: ['ENTREGADO','CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};
const getStatusOptions = (estado, tipoPedido) => {
  const t = VALID_TRANSITIONS[estado];
  if (!t) return [];
  return typeof t === 'function' ? t(tipoPedido) || [] : t;
};
const STATUS_LABEL = { PENDIENTE:'Pendiente', EN_PREPARACION:'En Preparación', LISTO:'Listo', ENTREGADO_AL_REPARTIDOR:'Entregado al Repartidor', ENTREGADO:'Entregado', CANCELADO:'Cancelado' };
const STATUS_ICON  = { PENDIENTE:'🕐', EN_PREPARACION:'🍳', LISTO:'✅', ENTREGADO_AL_REPARTIDOR:'🚚', ENTREGADO:'✅', CANCELADO:'❌' };
const STATUS_CSS   = { PENDIENTE:'or-status-badge--pendiente', EN_PREPARACION:'or-status-badge--preparacion', LISTO:'or-status-badge--listo', ENTREGADO_AL_REPARTIDOR:'or-status-badge--repartidor', ENTREGADO:'or-status-badge--entregado', CANCELADO:'or-status-badge--cancelado' };
 
const formatFecha = (v) => { const d = new Date(v); return isNaN(d) ? '-' : d.toLocaleString('es-ES'); };
const formatCurrency = (v) => `Q ${Number(v||0).toFixed(2)}`;
 
const OrderManagement = () => {
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
  const [orders,      setOrders]      = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
 
  useEffect(() => { fetchOrders(); fetchRestaurantsList(); }, [restaurantId]);
 
  if (isRestaurantAdmin && !hasRestaurantAssigned) return <NoRestaurantAssigned />;
 
  const fetchRestaurantsList = async () => {
    if (restaurantId) return;
    try {
      const res = await getRestaurants();
      setRestaurants(res?.data?.data || res?.data || []);
    } catch {}
  };
 
  const getRestaurantName = (rID) => {
    if (!rID) return '-';
    if (rID?.nombre) return rID.nombre;
    if (rID?.name)   return rID.name;
    const id = rID?._id || rID;
    const found = restaurants.find(r => (r._id||r.id) === id);
    return found?.nombre || found?.name || '-';
  };
 
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders({ restaurantID: restaurantId||undefined, restaurantId: restaurantId||undefined });
      setOrders(res?.data?.data || res?.data || []);
    } catch { toast.error('Error al cargar pedidos'); }
    finally { setLoading(false); }
  };
 
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setStatusLoading(true);
      await updateOrderStatus(selectedOrder._id, newStatus);
      toast.success('Estado actualizado correctamente');
      setIsStatusOpen(false);
      fetchOrders();
    } catch (err) { toast.error(err?.response?.data?.message || 'Error al actualizar estado'); }
    finally { setStatusLoading(false); }
  };
 
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Está seguro de cancelar este pedido?')) return;
    try {
      await cancelOrder(orderId);
      toast.success('Pedido cancelado');
      fetchOrders();
    } catch (err) { toast.error(err?.response?.data?.message || 'Error al cancelar el pedido'); }
  };
 
  /* Stats rápidas */
  const totalOrders   = orders.length;
  const enPrep        = orders.filter(o => o.estado === 'EN_PREPARACION').length;
  const listos        = orders.filter(o => o.estado === 'LISTO').length;
  const cancelados    = orders.filter(o => o.estado === 'CANCELADO').length;
 
  return (
    <div className="or-root">
 
      {/* HEADER */}
      <div className="or-header">
        <div>
          <div className="or-header-badge">
            <i className="ti ti-shopping-cart" aria-hidden="true" />
            Gestión de pedidos
          </div>
          <h1 className="or-header-title">Pedidos</h1>
          <p className="or-header-sub">Administra y actualiza el estado de todos los pedidos.</p>
        </div>
        {!(isRestaurantAdmin && hasRestaurantAssigned) && (
          <button className="or-btn-filter">
            <i className="ti ti-filter" aria-hidden="true" />
            Filtrar
          </button>
        )}
      </div>
 
      {/* STATS */}
      <div className="or-stats">
        <div className="or-stat or-stat--gold">
          <div className="or-stat-top"><div className="or-stat-icon"><i className="ti ti-shopping-cart" aria-hidden="true" /></div></div>
          <div className="or-stat-label">Total pedidos</div>
          <div className="or-stat-value">{totalOrders}</div>
        </div>
        <div className="or-stat or-stat--orange">
          <div className="or-stat-top"><div className="or-stat-icon or-stat-icon--o"><i className="ti ti-chef-hat" aria-hidden="true" /></div></div>
          <div className="or-stat-label">En preparación</div>
          <div className="or-stat-value or-stat-value--orange">{enPrep}</div>
        </div>
        <div className="or-stat or-stat--green">
          <div className="or-stat-top"><div className="or-stat-icon or-stat-icon--g"><i className="ti ti-check" aria-hidden="true" /></div></div>
          <div className="or-stat-label">Listos</div>
          <div className="or-stat-value or-stat-value--green">{listos}</div>
        </div>
        <div className="or-stat or-stat--red">
          <div className="or-stat-top"><div className="or-stat-icon or-stat-icon--r"><i className="ti ti-x" aria-hidden="true" /></div></div>
          <div className="or-stat-label">Cancelados</div>
          <div className="or-stat-value or-stat-value--red">{cancelados}</div>
        </div>
      </div>
 
      {/* TABLA */}
      <div className="or-section">
        <div className="or-section-header">
          <span className="or-section-title">Lista de pedidos</span>
          <span className="or-section-badge">{orders.length} registros</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="or-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Número</th>
                <th style={{ width: '16%' }}>Restaurante</th>
                <th style={{ width: '8%'  }}>Mesa</th>
                <th style={{ width: '14%' }}>Cliente</th>
                <th style={{ width: '10%' }}>Total</th>
                <th style={{ width: '14%' }}>Estado</th>
                <th style={{ width: '16%' }}>Fecha</th>
                <th style={{ width: '10%', textAlign:'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ padding: 0 }}>
                  <div className="or-table-loading"><div className="or-table-spinner" />Cargando pedidos...</div>
                </td></tr>
              ) : orders.length > 0 ? (
                orders.map((order, idx) => {
                  const estado     = order.estado;
                  const isCompleted = estado === 'ENTREGADO' || estado === 'CANCELADO';
                  const opts = getStatusOptions(estado, order.tipoPedido);
                  return (
                    <tr key={order._id || idx} style={{ animationDelay:`${idx*.03}s` }}>
                      <td className="or-td-main">{order.numeroOrden || '-'}</td>
                      <td>{getRestaurantName(order.restaurantID)}</td>
                      <td>{order.mesaID?.numero ?? order.mesaID?.number ?? '-'}</td>
                      <td>{order.clienteNombre || 'Cliente General'}</td>
                      <td className="or-td-gold">{formatCurrency(order.total)}</td>
                      <td>
                        <span className={`or-status-badge ${STATUS_CSS[estado] || ''}`}>
                          {STATUS_ICON[estado]} {STATUS_LABEL[estado] || estado}
                        </span>
                      </td>
                      <td style={{ fontSize:11, color:'rgba(245,237,224,.35)' }}>{formatFecha(order.createdAt)}</td>
                      <td>
                        <div className="or-action-btns" style={{ justifyContent:'center' }}>
                          <button className="or-action-btn or-action-btn--view" onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }} title="Ver detalle" aria-label="Ver detalle">
                            <i className="ti ti-eye" aria-hidden="true" />
                          </button>
                          <button className="or-action-btn or-action-btn--edit" onClick={() => { setSelectedOrder(order); setNewStatus(opts[0]||''); setIsStatusOpen(true); }} disabled={isCompleted||opts.length===0} title="Cambiar estado" aria-label="Cambiar estado">
                            <i className="ti ti-clipboard-list" aria-hidden="true" />
                          </button>
                          <button className="or-action-btn or-action-btn--cancel" onClick={() => handleCancelOrder(order._id)} disabled={isCompleted} title="Cancelar" aria-label="Cancelar">
                            <i className="ti ti-x" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="8" style={{ padding:0 }}>
                  <div className="or-table-empty">
                    <i className="ti ti-shopping-cart-off" aria-hidden="true" />
                    No hay pedidos disponibles
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="or-table-footer">
          <span className="or-table-footer-info">Mostrando 1 a {Math.min(10, orders.length)} de {orders.length} pedidos</span>
          <div className="or-table-footer-right">
            Registros por página
            <select className="or-page-select">
              <option>10</option><option>20</option><option>50</option>
            </select>
          </div>
        </div>
      </div>
 
      {/* MODAL DETALLE */}
      {isDetailOpen && selectedOrder && (
        <div className="or-modal-overlay">
          <div className="or-modal or-modal--lg">
            <div className="or-modal-header">
              <div className="or-modal-header-left">
                <div className="or-modal-icon"><i className="ti ti-receipt" aria-hidden="true" /></div>
                <div>
                  <div className="or-modal-title">Detalle del pedido</div>
                  <div className="or-modal-sub">#{selectedOrder.numeroOrden}</div>
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="or-modal-close" aria-label="Cerrar">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            <div className="or-modal-body">
 
              {/* Info básica */}
              <div className="or-modal-section" style={{ marginBottom:16 }}>
                <div className="or-modal-section-title">Información del pedido</div>
                <div className="or-detail-grid">
                  <div className="or-detail-item"><div className="or-detail-label"><i className="ti ti-hash" aria-hidden="true" />Número</div><div className="or-detail-value">{selectedOrder.numeroOrden||'-'}</div></div>
                  <div className="or-detail-item"><div className="or-detail-label"><i className="ti ti-building-store" aria-hidden="true" />Restaurante</div><div className="or-detail-value">{getRestaurantName(selectedOrder.restaurantID)}</div></div>
                  <div className="or-detail-item"><div className="or-detail-label"><i className="ti ti-armchair" aria-hidden="true" />Mesa</div><div className="or-detail-value">{selectedOrder.mesaID?.numero??selectedOrder.mesaID?.number??'-'}</div></div>
                  <div className="or-detail-item"><div className="or-detail-label"><i className="ti ti-user" aria-hidden="true" />Cliente</div><div className="or-detail-value">{selectedOrder.clienteNombre||'Cliente General'}</div></div>
                  <div className="or-detail-item"><div className="or-detail-label"><i className="ti ti-truck-delivery" aria-hidden="true" />Tipo</div>
                    <div className="or-detail-value">{selectedOrder.tipoPedido==='EN_MESA'?'🍽️ En Mesa':selectedOrder.tipoPedido==='A_DOMICILIO'?'🏠 A Domicilio':'📦 Para Llevar'}</div>
                  </div>
                  <div className="or-detail-item"><div className="or-detail-label"><i className="ti ti-calendar" aria-hidden="true" />Fecha</div><div className="or-detail-value" style={{fontSize:11}}>{formatFecha(selectedOrder.createdAt)}</div></div>
                  <div className="or-detail-item"><div className="or-detail-label"><i className="ti ti-activity" aria-hidden="true" />Estado</div>
                    <div className="or-detail-value"><span className={`or-status-badge ${STATUS_CSS[selectedOrder.estado]||''}`}>{STATUS_ICON[selectedOrder.estado]} {STATUS_LABEL[selectedOrder.estado]||selectedOrder.estado}</span></div>
                  </div>
                  <div className="or-detail-item"><div className="or-detail-label"><i className="ti ti-credit-card" aria-hidden="true" />Pago</div><div className="or-detail-value">{selectedOrder.metodoPago||'PENDIENTE'}</div></div>
                </div>
              </div>
 
              {/* Items */}
              {selectedOrder.items?.length > 0 && (
                <div className="or-modal-section" style={{ marginBottom:16 }}>
                  <div className="or-modal-section-title">Ítems del pedido</div>
                  <table className="or-items-table">
                    <thead><tr><th style={{width:'40%'}}>Plato</th><th style={{width:'15%'}}>Cant.</th><th style={{width:'20%'}}>P. Unit.</th><th style={{width:'25%',textAlign:'right'}}>Subtotal</th></tr></thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => {
                        const nombre = item.nombre||item.plato?.nombre||item.plato?.name||item.menu?.nombre||item.menu?.name||'N/A';
                        const qty = item.cantidad||1;
                        const pUnit = item.precioUnitario||0;
                        const sub = item.subtotal||(pUnit*qty);
                        return (
                          <tr key={idx}>
                            <td className="or-td-main">{nombre}</td>
                            <td>{qty}</td>
                            <td>{formatCurrency(pUnit)}</td>
                            <td className="td-right">{formatCurrency(sub)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
 
              {/* Financiero */}
              <div className="or-finance-box">
                <div className="or-finance-row"><span>Subtotal</span><span className="or-finance-val">{formatCurrency(selectedOrder.subtotal)}</span></div>
                <div className="or-finance-row"><span>Impuesto</span><span className="or-finance-val">{formatCurrency(selectedOrder.impuesto)}</span></div>
                {Number(selectedOrder.descuento) > 0 && <div className="or-finance-row or-finance-row--discount"><span>Descuento</span><span>-{formatCurrency(selectedOrder.descuento)}</span></div>}
                {Number(selectedOrder.descuentoPorCoupon) > 0 && <div className="or-finance-row or-finance-row--discount"><span>Cupón {selectedOrder.couponCode?`(${selectedOrder.couponCode})`:''}</span><span>-{formatCurrency(selectedOrder.descuentoPorCoupon)}</span></div>}
                {Number(selectedOrder.propina) > 0 && <div className="or-finance-row"><span>Propina</span><span className="or-finance-val">{formatCurrency(selectedOrder.propina)}</span></div>}
                {Number(selectedOrder.cargosExtra) > 0 && <div className="or-finance-row"><span>Cargos extra</span><span className="or-finance-val">{formatCurrency(selectedOrder.cargosExtra)}</span></div>}
                <div className="or-finance-row or-finance-row--total"><span>TOTAL</span><span>{formatCurrency(selectedOrder.total)}</span></div>
              </div>
 
            </div>
            <div className="or-modal-footer">
              <button onClick={() => setIsDetailOpen(false)} className="or-btn or-btn-ghost">
                <i className="ti ti-x" aria-hidden="true" />Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* MODAL CAMBIAR ESTADO */}
      {isStatusOpen && selectedOrder && (
        <div className="or-modal-overlay">
          <div className="or-modal or-modal--lg">
            <div className="or-modal-header">
              <div className="or-modal-header-left">
                <div className="or-modal-icon"><i className="ti ti-clipboard-list" aria-hidden="true" /></div>
                <div>
                  <div className="or-modal-title">Cambiar estado</div>
                  <div className="or-modal-sub">Pedido #{selectedOrder.numeroOrden}</div>
                </div>
              </div>
              <button onClick={() => setIsStatusOpen(false)} className="or-modal-close" aria-label="Cerrar">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            <div className="or-modal-body">
 
              {/* Resumen */}
              <div className="or-modal-section" style={{ marginBottom:16 }}>
                <div className="or-modal-section-title">Resumen del pedido</div>
                <div className="or-detail-grid">
                  <div className="or-detail-item"><div className="or-detail-label">Pedido</div><div className="or-detail-value">#{selectedOrder.numeroOrden}</div></div>
                  <div className="or-detail-item"><div className="or-detail-label">Tipo</div>
                    <div className="or-detail-value">{selectedOrder.tipoPedido==='EN_MESA'?'🍽️ EN_MESA':selectedOrder.tipoPedido==='A_DOMICILIO'?'🏠 A_DOMICILIO':'📦 PARA_LLEVAR'}</div>
                  </div>
                  <div className="or-detail-item"><div className="or-detail-label">Restaurante</div><div className="or-detail-value">{getRestaurantName(selectedOrder.restaurantID)}</div></div>
                  <div className="or-detail-item"><div className="or-detail-label">Cliente</div><div className="or-detail-value">{selectedOrder.clienteNombre||'Cliente General'}</div></div>
                </div>
              </div>
 
              {/* Progresión */}
              <div className="or-modal-section or-modal-section--orange" style={{ marginBottom:16 }}>
                <div className="or-modal-section-title">Flujo del pedido ({selectedOrder.tipoPedido})</div>
                {(() => {
                  const steps = selectedOrder.tipoPedido==='A_DOMICILIO'
                    ? ['PENDIENTE','EN_PREPARACION','ENTREGADO_AL_REPARTIDOR','ENTREGADO']
                    : ['PENDIENTE','EN_PREPARACION','LISTO'];
                  const cur = steps.indexOf(selectedOrder.estado);
                  return (
                    <div className="or-progress-track">
                      {steps.map((s, i) => (
                        <>
                          <div key={s} className="or-progress-step">
                            <div className={`or-progress-circle${i < cur ? ' or-progress-circle--done' : i === cur ? ' or-progress-circle--active' : ''}`}>
                              {STATUS_ICON[s]}
                            </div>
                            <div className={`or-progress-label${i < cur ? ' or-progress-label--done' : i === cur ? ' or-progress-label--active' : ''}`}>
                              {STATUS_LABEL[s]}
                            </div>
                          </div>
                          {i < steps.length-1 && <div key={`line-${i}`} className={`or-progress-line${i < cur ? ' or-progress-line--done' : ''}`} />}
                        </>
                      ))}
                    </div>
                  );
                })()}
              </div>
 
              {/* Opciones de estado */}
              {getStatusOptions(selectedOrder.estado, selectedOrder.tipoPedido).length > 0 && (
                <div className="or-modal-section or-modal-section--blue" style={{ marginBottom:16 }}>
                  <div className="or-modal-section-title">Seleccionar nuevo estado</div>
                  <div className="or-status-options">
                    {getStatusOptions(selectedOrder.estado, selectedOrder.tipoPedido).map((s) => (
                      <label key={s} className="or-status-option">
                        <input type="radio" name="newStatus" value={s} checked={newStatus===s} onChange={e => setNewStatus(e.target.value)} />
                        <span className="or-status-option-label">{STATUS_LABEL[s]||s}</span>
                        <span className="or-status-option-emoji">{STATUS_ICON[s]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
 
              {/* Notas */}
              <div className="or-modal-section or-modal-section--green">
                <div className="or-modal-section-title">Notas adicionales (Opcional)</div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="or-textarea" rows={3} placeholder="El cliente espera cambio de mesa, orden especial, etc." />
              </div>
 
            </div>
            <div className="or-modal-footer">
              <span className="or-modal-footer-hint"><i className="ti ti-info-circle" aria-hidden="true" />Confirmación requerida</span>
              <button onClick={() => setIsStatusOpen(false)} className="or-btn or-btn-danger">
                <i className="ti ti-x" aria-hidden="true" />Cancelar
              </button>
              {getStatusOptions(selectedOrder.estado, selectedOrder.tipoPedido).length > 0 && (
                <button onClick={handleUpdateStatus} disabled={statusLoading} className="or-btn or-btn-primary">
                  {statusLoading ? <><span className="or-spinner" />Guardando...</> : <><i className="ti ti-check" aria-hidden="true" />Actualizar estado</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
 
    </div>
  );
};
 
export default OrderManagement;