import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createInvoice, deleteInvoice, getInvoiceById, getInvoices, updateInvoiceStatus } from '../../../shared/api/invoiceService.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import '../../../styles/invoices.css';
 
/* ── Constants — INTACTOS ── */
const STATUS_OPTIONS = [
  { value:'PENDIENTE', label:'Pendiente' },
  { value:'PAGADA',    label:'Pagada' },
  { value:'CANCELADA', label:'Cancelada' },
];
const STATUS_CSS = {
  PAGADA:    'iv-badge--pagada',
  PENDIENTE: 'iv-badge--pendiente',
  CANCELADA: 'iv-badge--cancelada',
};
const STATUS_ICON = { PAGADA:'ti-circle-check', PENDIENTE:'ti-clock', CANCELADA:'ti-circle-x' };
 
/* ── Helpers — INTACTOS ── */
const formatDate = (value) => {
  if (!value) return 'No especificada';
  return new Date(value).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
};
const getInvoiceLabel = (invoice) => invoice?._id?.slice(-8).toUpperCase() || invoice?._id || '-';
const getOrderLabel   = (invoice) => invoice?.orderID?.numeroOrden || invoice?.orderID?._id?.slice(-6).toUpperCase() || '-';
const getItemName     = (item)    => item.nombre || item.plato?.nombre || item.menu?.nombre || 'Item sin nombre';
 
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
 
const InvoicesPage = () => {
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
 
  /* ── State — INTACTO ── */
  const [invoices,         setInvoices]         = useState([]);
  const [selectedInvoice,  setSelectedInvoice]  = useState(null);
  const [loading,          setLoading]          = useState(false);
  const [fetchError,       setFetchError]       = useState('');
  const [search,           setSearch]           = useState('');
  const [page,             setPage]             = useState(1);
  const [limit]                                 = useState(12);
  const [totalPages,       setTotalPages]       = useState(1);
  const [isCreateOpen,     setIsCreateOpen]     = useState(false);
  const [newOrderId,       setNewOrderId]       = useState('');
  const [creating,         setCreating]         = useState(false);
 
  /* ── Filtrado local — INTACTO ── */
  const loadedInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;
    return invoices.filter((inv) => {
      const id     = inv._id?.toLowerCase() || '';
      const order  = inv.orderID?.numeroOrden?.toLowerCase() || inv.orderID?._id?.toLowerCase() || '';
      return id.includes(query) || order.includes(query);
    });
  }, [invoices, search]);
 
  /* ── Carga — INTACTO ── */
  const loadInvoices = async (pageToLoad = 1) => {
    try {
      setLoading(true); setFetchError('');
      const res = await getInvoices({ page:pageToLoad, limit, restaurantID:restaurantId||undefined, restaurantId:restaurantId||undefined });
      setInvoices(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setPage(res.data.pagination?.currentPage || pageToLoad);
    } catch (err) { setFetchError(err?.response?.data?.message || 'Error al cargar facturas'); }
    finally { setLoading(false); }
  };
 
  useEffect(() => { loadInvoices(1); }, [restaurantId]);
 
  if (isRestaurantAdmin && !hasRestaurantAssigned) return <NoRestaurantAssigned />;
 
  /* ── Handlers — INTACTOS ── */
  const handleSelectInvoice = async (invoice) => {
    if (!invoice?._id) return;
    setLoading(true);
    try {
      const res = await getInvoiceById(invoice._id);
      setSelectedInvoice(res.data.data);
    } catch (err) { toast.error(err?.response?.data?.message || 'No se pudo cargar la factura'); }
    finally { setLoading(false); }
  };
 
  const handleCreateInvoice = async () => {
    if (!newOrderId.trim()) { toast.error('Ingresa el ID del pedido'); return; }
    try {
      setCreating(true);
      await createInvoice({ orderID:newOrderId.trim() });
      toast.success('Factura creada');
      setNewOrderId(''); setIsCreateOpen(false);
      await loadInvoices(1);
    } catch (err) { toast.error(err?.response?.data?.message || 'Error al crear la factura'); }
    finally { setCreating(false); }
  };
 
  const handleStatusChange = async (newStatus) => {
    if (!selectedInvoice?._id) return;
    try {
      setLoading(true);
      const res = await updateInvoiceStatus(selectedInvoice._id, { estado:newStatus });
      setSelectedInvoice(res.data.data);
      setInvoices(curr => curr.map(inv => inv._id === res.data.data._id ? res.data.data : inv));
      toast.success('Estado actualizado');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error al actualizar estado'); }
    finally { setLoading(false); }
  };
 
  const handleDeleteInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    if (!window.confirm('¿Eliminar esta factura? Esta acción no se puede deshacer.')) return;
    try {
      setLoading(true);
      await deleteInvoice(invoiceId);
      toast.success('Factura eliminada');
      if (selectedInvoice?._id === invoiceId) setSelectedInvoice(null);
      await loadInvoices(page);
    } catch (err) { toast.error(err?.response?.data?.message || 'Error al eliminar factura'); }
    finally { setLoading(false); }
  };
 
  const dueDate = (invoice) => {
    if (!invoice?.fechaEmision) return 'No aplica';
    const d = new Date(invoice.fechaEmision);
    d.setDate(d.getDate() + 15);
    return d.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' });
  };
 
  const selectedImage = selectedInvoice?.orderID?.restaurantID?.fotos?.[0] || FALLBACK_IMG;
 
  /* ── Render ── */
  return (
    <div className="iv-root">
 
      {/* HEADER */}
      <div className="iv-header">
        <div>
          <div className="iv-header-eyebrow">
            <i className="ti ti-receipt" aria-hidden="true" />
            Gestión de Facturas
          </div>
          <h1 className="iv-header-title">Facturas</h1>
          <p className="iv-header-sub">Lista, filtro y detalle rápido de cada factura creada a partir de pedidos.</p>
        </div>
        <button onClick={() => setIsCreateOpen(c => !c)} className="iv-btn-new">
          <i className="ti ti-plus" aria-hidden="true" />
          + Crear Nueva Factura
        </button>
      </div>
 
      {/* PANEL CREAR */}
      {isCreateOpen && (
        <div className="iv-create-panel">
          <div className="iv-create-inner">
            <div>
              <div className="iv-create-desc-title">Crear factura desde pedido</div>
              <div className="iv-create-desc-sub">Ingresa el ID del pedido existente para generar su factura automáticamente.</div>
            </div>
            <div className="iv-create-input-row">
              <input
                value={newOrderId}
                onChange={e => setNewOrderId(e.target.value)}
                placeholder="ID del pedido"
                className="iv-create-input"
              />
              <button onClick={handleCreateInvoice} disabled={creating} className="iv-create-submit">
                {creating ? 'Creando...' : 'Generar factura'}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* GRID PRINCIPAL */}
      <div className="iv-layout">
 
        {/* ── TABLA IZQUIERDA ── */}
        <section className="iv-table-panel">
 
          {/* Buscador */}
          <div className="iv-search-wrap">
            <i className="ti ti-search iv-search-icon" aria-hidden="true" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por número de factura o ID de pedido..."
              className="iv-search-input"
            />
          </div>
 
          {/* Tabla */}
          <div className="iv-table-wrap">
            <table className="iv-table">
              <thead>
                <tr>
                  <th style={{width:'16%'}}>ID Factura</th>
                  <th style={{width:'16%'}}>Número Orden</th>
                  <th style={{width:'14%'}}>Estado</th>
                  <th style={{width:'22%'}}>Fecha Creación</th>
                  <th style={{width:'14%'}}>Monto Total</th>
                  <th style={{width:'18%'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{padding:0}}>
                    <div className="iv-table-loading"><div className="iv-table-spinner" />Cargando facturas...</div>
                  </td></tr>
                ) : fetchError ? (
                  <tr><td colSpan="6" style={{padding:0}}>
                    <div className="iv-table-error"><i className="ti ti-alert-circle" aria-hidden="true" style={{display:'block',fontSize:20,marginBottom:6}} />{fetchError}</div>
                  </td></tr>
                ) : loadedInvoices.length === 0 ? (
                  <tr><td colSpan="6" style={{padding:0}}>
                    <div className="iv-table-empty">
                      <i className="ti ti-receipt-off" aria-hidden="true" />
                      No hay facturas que coincidan con la búsqueda.
                    </div>
                  </td></tr>
                ) : (
                  loadedInvoices.map((invoice, idx) => (
                    <tr
                      key={invoice._id}
                      className={selectedInvoice?._id === invoice._id ? 'iv-row--active' : ''}
                      style={{ animationDelay:`${idx*.03}s` }}
                    >
                      <td className="iv-td-main" onClick={() => handleSelectInvoice(invoice)}>{getInvoiceLabel(invoice)}</td>
                      <td className="iv-td-order" onClick={() => handleSelectInvoice(invoice)}>{getOrderLabel(invoice)}</td>
                      <td onClick={() => handleSelectInvoice(invoice)}>
                        <span className={`iv-badge ${STATUS_CSS[invoice.estado]||'iv-badge--pendiente'}`}>
                          <i className={`ti ${STATUS_ICON[invoice.estado]||'ti-clock'}`} style={{fontSize:8}} aria-hidden="true" />
                          {STATUS_OPTIONS.find(o => o.value===invoice.estado)?.label || invoice.estado}
                        </span>
                      </td>
                      <td onClick={() => handleSelectInvoice(invoice)} style={{fontSize:11,color:'rgba(245,237,224,.35)'}}>{formatDate(invoice.fechaEmision)}</td>
                      <td className="iv-td-total" onClick={() => handleSelectInvoice(invoice)}>Q {Number(invoice.total??0).toFixed(2)}</td>
                      <td>
                        <div className="iv-action-btns">
                          <button className="iv-btn-view" onClick={() => handleSelectInvoice(invoice)}>
                            <i className="ti ti-eye" aria-hidden="true" /> Ver
                          </button>
                          <button className="iv-btn-delete" onClick={() => handleDeleteInvoice(invoice._id)}>
                            <i className="ti ti-trash" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
 
          {/* Footer */}
          <div className="iv-table-footer">
            <span className="iv-table-footer-info">Mostrando {loadedInvoices.length} de {invoices.length} facturas</span>
            <div className="iv-pagination">
              <button onClick={() => loadInvoices(Math.max(page-1,1))} disabled={page===1} className="iv-page-btn" aria-label="Anterior">
                <i className="ti ti-chevron-left" style={{fontSize:13}} aria-hidden="true" />
              </button>
              {[...Array(totalPages).keys()].map(i => {
                const p = i+1;
                return (
                  <button key={p} onClick={() => loadInvoices(p)} className={`iv-page-btn${p===page?' iv-page-btn--active':''}`}>{p}</button>
                );
              })}
              <button onClick={() => loadInvoices(Math.min(page+1,totalPages))} disabled={page===totalPages} className="iv-page-btn" aria-label="Siguiente">
                <i className="ti ti-chevron-right" style={{fontSize:13}} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
 
        {/* ── ASIDE DERECHO ── */}
        <aside className="iv-aside">
          {selectedInvoice ? (
            <>
              {/* Hero con imagen */}
              <div
                className="iv-invoice-hero"
                style={{ backgroundImage:`url(${selectedImage})` }}
              >
                <div className="iv-invoice-hero-content">
                  <div>
                    <div className="iv-invoice-hero-eyebrow">Factura</div>
                    <div className="iv-invoice-hero-id">{getInvoiceLabel(selectedInvoice)}</div>
                    <div className="iv-invoice-hero-order">Orden {getOrderLabel(selectedInvoice)}</div>
                  </div>
                  <span className={`iv-badge ${STATUS_CSS[selectedInvoice.estado]||'iv-badge--pendiente'}`}>
                    <i className={`ti ${STATUS_ICON[selectedInvoice.estado]||'ti-clock'}`} style={{fontSize:8}} aria-hidden="true" />
                    {STATUS_OPTIONS.find(o => o.value===selectedInvoice.estado)?.label || selectedInvoice.estado}
                  </span>
                </div>
              </div>
 
              <div className="iv-aside-body">
 
                {/* Info básica */}
                <div className="iv-aside-section">
                  <div className="iv-aside-section-header">
                    <div>
                      <div className="iv-aside-section-title">Detalle de Factura</div>
                      <div className="iv-aside-section-sub">Actualiza el estado o revisa los valores.</div>
                    </div>
                    <button className="iv-btn-aside-delete" onClick={() => handleDeleteInvoice(selectedInvoice._id)}>
                      <i className="ti ti-trash" aria-hidden="true" />
                      Eliminar
                    </button>
                  </div>
                  <div className="iv-info-grid">
                    <div className="iv-info-field"><div className="iv-info-label">ID de Factura</div><div className="iv-info-value iv-info-value--mono">{selectedInvoice._id}</div></div>
                    <div className="iv-info-field"><div className="iv-info-label">ID de Orden</div><div className="iv-info-value iv-info-value--mono">{selectedInvoice.orderID?._id||'-'}</div></div>
                    <div className="iv-info-field"><div className="iv-info-label">Fecha Creación</div><div className="iv-info-value" style={{fontSize:11}}>{formatDate(selectedInvoice.fechaEmision)}</div></div>
                    <div className="iv-info-field"><div className="iv-info-label">Fecha Vencimiento</div><div className="iv-info-value">{dueDate(selectedInvoice)}</div></div>
                  </div>
                </div>
 
                {/* Estado + Financiero */}
                <div className="iv-aside-section">
                  <div className="iv-status-row">
                    <span className="iv-status-label">Estado Actual</span>
                    <select value={selectedInvoice.estado} onChange={e => handleStatusChange(e.target.value)} className="iv-status-select">
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="iv-finance-grid">
                    <div className="iv-finance-item"><div className="iv-finance-key">Subtotal</div><div className="iv-finance-val">Q {Number(selectedInvoice.subtotal??0).toFixed(2)}</div></div>
                    <div className="iv-finance-item"><div className="iv-finance-key">Impuesto</div><div className="iv-finance-val">Q {Number(selectedInvoice.impuesto??0).toFixed(2)}</div></div>
                    <div className="iv-finance-item"><div className="iv-finance-key">Descuento</div><div className="iv-finance-val">Q {Number(selectedInvoice.descuento??0).toFixed(2)}</div></div>
                    <div className="iv-finance-item"><div className="iv-finance-key">Propina</div><div className="iv-finance-val">Q {Number(selectedInvoice.propina??0).toFixed(2)}</div></div>
                  </div>
                  <div className="iv-finance-total">
                    <span className="iv-finance-total-label">Total</span>
                    <span className="iv-finance-total-val">Q {Number(selectedInvoice.total??0).toFixed(2)}</span>
                  </div>
                </div>
 
                {/* Items */}
                <div className="iv-aside-section">
                  <div className="iv-aside-section-header">
                    <div>
                      <div className="iv-aside-section-title">Items</div>
                      <div className="iv-aside-section-sub">Detalle de la orden vinculada.</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:500,color:'var(--iv-gold)'}}>
                      Q {Number(selectedInvoice.total??0).toFixed(2)}
                    </span>
                  </div>
                  <div className="iv-items-list">
                    {selectedInvoice.orderID?.items?.length > 0 ? (
                      selectedInvoice.orderID.items.map((item, idx) => (
                        <div key={`${item.nombre}-${idx}`} className="iv-item-row">
                          <div>
                            <div className="iv-item-name">{getItemName(item)}</div>
                            <div className="iv-item-sub">Q {Number(item.precioUnitario??0).toFixed(2)} × {item.cantidad}</div>
                          </div>
                          <div className="iv-item-total">
                            Q {Number(item.subtotal ?? (item.precioUnitario * item.cantidad) ?? 0).toFixed(2)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="iv-items-empty">No hay items disponibles para esta factura.</div>
                    )}
                  </div>
                </div>
 
                {/* Info cliente */}
                <div className="iv-aside-section">
                  <div className="iv-aside-section-header">
                    <div><div className="iv-aside-section-title">Información del Cliente</div></div>
                  </div>
                  <div className="iv-client-grid">
                    <div className="iv-client-field"><div className="iv-client-label">Nombre</div><div className="iv-client-val">{selectedInvoice.orderID?.clienteNombre||selectedInvoice.userID||'No disponible'}</div></div>
                    <div className="iv-client-field"><div className="iv-client-label">Teléfono</div><div className="iv-client-val">{selectedInvoice.orderID?.clienteTelefono||'No disponible'}</div></div>
                  </div>
                  <div className="iv-client-full"><div className="iv-client-label">Restaurante</div><div className="iv-client-val">{selectedInvoice.orderID?.restaurantID?.nombre||'No especificado'}</div></div>
                  <div className="iv-client-full"><div className="iv-client-label">Método de Pago</div><div className="iv-client-val">{selectedInvoice.metodoPago||'PENDIENTE'}</div></div>
                </div>
 
              </div>
            </>
          ) : (
            <div style={{padding:16}}>
              <div className="iv-aside-empty">
                <i className="ti ti-receipt" aria-hidden="true" />
                <div className="iv-aside-empty-title">Selecciona una factura</div>
                <div className="iv-aside-empty-sub">Haz clic en una fila para ver su detalle y cambiar su estado.</div>
              </div>
            </div>
          )}
        </aside>
 
      </div>
    </div>
  );
};
 
export default InvoicesPage;
 