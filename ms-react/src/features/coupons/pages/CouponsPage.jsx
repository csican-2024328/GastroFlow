import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import {
  getRestaurantVigentesCoupons, getCoupons, createCoupon,
  updateCoupon, deactivateCoupon, activateCoupon,
} from '../../../shared/api/couponService.js';
import '../../../styles/coupons.css';
 
/* ── Helpers — INTACTOS ── */
const formatDate = (value) => {
  if (!value) return 'No especificada';
  return new Date(value).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' });
};
 
const getCouponStatus = (coupon) => {
  if (coupon.isActive === false) return { label:'Inactivo', css:'cp-status--inactivo' };
  const exp = new Date(coupon.fechaExpiracion);
  if (isNaN(exp.getTime())) return { label:'Activo', css:'cp-status--activo' };
  const now = new Date();
  if (exp < now) return { label:'Expirado', css:'cp-status--expirado' };
  const diffDays = Math.ceil((exp.getTime()-now.getTime())/(1000*60*60*24));
  if (diffDays <= 7) return { label:'Por vencer', css:'cp-status--porvencer' };
  return { label:'Activo', css:'cp-status--activo' };
};
 
const formatDiscount = (coupon) => coupon.tipo==='PORCENTAJE'
  ? `${coupon.porcentajeDescuento??0}%`
  : `Q ${Number(coupon.montoFijo??0).toFixed(2)}`;
 
/* ══════════════════════════════════════════
   COUPON CARD
══════════════════════════════════════════ */
const CouponCard = ({ coupon, isAdmin, onEdit, onToggleActive, delay }) => {
  const [copied, setCopied] = useState(false);
  const status = useMemo(() => getCouponStatus(coupon), [coupon]);
 
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.codigo);
      setCopied(true); toast.success('Código copiado');
      window.setTimeout(() => setCopied(false), 1600);
    } catch { toast.error('No se pudo copiar el código'); }
  };
 
  return (
    <article className={`cp-card${coupon.isActive===false?' cp-card--inactive':''}`} style={{ animationDelay:`${delay}s` }}>
 
      {/* Hero */}
      <div className="cp-card-hero">
        <div className="cp-card-hero-left">
          <div className="cp-card-hero-eyebrow">Cupón</div>
          <div className="cp-card-hero-code">{coupon.codigo}</div>
        </div>
        <span className={`cp-status ${status.css}`}>
          <i className={`ti ${status.label==='Activo'?'ti-check':status.label==='Inactivo'?'ti-ban':status.label==='Expirado'?'ti-clock-off':'ti-alert-triangle'}`} style={{fontSize:9}} aria-hidden="true" />
          {status.label}
        </span>
      </div>
 
      {/* Cuerpo */}
      <div className="cp-card-body">
 
        {/* Tipo + Descuento */}
        <div className="cp-card-info-grid">
          <div className="cp-card-info-item">
            <div className="cp-card-info-label">Tipo</div>
            <div className="cp-card-info-value">
              {coupon.tipo==='PORCENTAJE' ? 'Porcentaje' : 'Monto fijo'}
            </div>
          </div>
          <div className="cp-card-info-item">
            <div className="cp-card-info-label">Descuento</div>
            <div className="cp-card-info-value cp-card-info-value--gold">{formatDiscount(coupon)}</div>
          </div>
        </div>
 
        {/* Detalles */}
        <div className="cp-card-details">
          <div className="cp-card-detail-row">
            <i className="ti ti-calendar-event" aria-hidden="true" />
            <span><span className="cp-card-detail-strong">Expira:</span> {formatDate(coupon.fechaExpiracion)}</span>
          </div>
          {coupon.descripcion && (
            <div className="cp-card-detail-row">
              <i className="ti ti-info-circle" aria-hidden="true" />
              <span style={{ overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                <span className="cp-card-detail-strong">Detalle:</span> {coupon.descripcion}
              </span>
            </div>
          )}
          {coupon.montoMinimo > 0 && (
            <div className="cp-card-detail-row">
              <i className="ti ti-currency-dollar" aria-hidden="true" />
              <span><span className="cp-card-detail-strong">Mínimo:</span> Q {Number(coupon.montoMinimo).toFixed(2)}</span>
            </div>
          )}
        </div>
 
        {/* Botón copiar */}
        {copied ? (
          <button className="cp-copy-btn cp-copy-btn--copied" disabled>
            <i className="ti ti-check" aria-hidden="true" />
            Copiado
          </button>
        ) : coupon.isActive === false ? (
          <button className="cp-copy-btn cp-copy-btn--inactive" disabled>
            <i className="ti ti-ban" aria-hidden="true" />
            Inactivo
          </button>
        ) : (
          <button className="cp-copy-btn cp-copy-btn--default" onClick={handleCopyCode}>
            <i className="ti ti-copy" aria-hidden="true" />
            Copiar código
          </button>
        )}
 
        {/* Admin actions */}
        {isAdmin && (
          <div className="cp-card-admin-actions">
            <button className="cp-btn-edit" onClick={() => onEdit(coupon)}>
              <i className="ti ti-edit" aria-hidden="true" />
              Editar
            </button>
            <button
              className={`cp-btn-toggle${coupon.isActive?' cp-btn-toggle--deactivate':' cp-btn-toggle--activate'}`}
              onClick={() => onToggleActive(coupon)}
            >
              <i className={`ti ${coupon.isActive?'ti-toggle-right':'ti-toggle-left'}`} aria-hidden="true" />
              {coupon.isActive ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
 
/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export const CouponsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
  const restaurants      = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);
 
  /* ── State — INTACTO ── */
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [coupons,     setCoupons]     = useState([]);
  const [allCoupons,  setAllCoupons]  = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    codigo:'', descripcion:'', tipo:'PORCENTAJE', porcentajeDescuento:0, montoFijo:0,
    fechaExpiracion:'', fechaInicio:'', usosMaximos:0, montoMinimo:0, montoMaximoDescuento:0,
  });
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => { fetchRestaurants(1, 50); }, [fetchRestaurants]);
  useEffect(() => { if (restaurantId) setSelectedRestaurantId(restaurantId); }, [restaurantId]);
 
  if (isRestaurantAdmin && !hasRestaurantAssigned) return <NoRestaurantAssigned />;
 
  useEffect(() => {
    if (!selectedRestaurantId) return;
    const loadCoupons = async () => {
      try {
        setLoading(true); setError('');
        const response = await getRestaurantVigentesCoupons(selectedRestaurantId);
        setCoupons(response.data.data || []);
        if (user?.role==='RESTAURANT_ADMIN' || user?.role==='PLATFORM_ADMIN') {
          try {
            const active   = await getCoupons({ restaurantID:selectedRestaurantId, isActive:true,  limit:100 });
            const inactive = await getCoupons({ restaurantID:selectedRestaurantId, isActive:false, limit:100 });
            setAllCoupons([...(active.data.data||[]), ...(inactive.data.data||[])]);
          } catch { setAllCoupons(response.data.data||[]); }
        }
      } catch (err) {
        setCoupons([]); setError(err.response?.data?.message||'Error al obtener cupones vigentes');
      } finally { setLoading(false); }
    };
    loadCoupons();
  }, [selectedRestaurantId, user]);
 
  const refreshCoupons = async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    try {
      const active   = await getCoupons({ restaurantID:selectedRestaurantId, isActive:true,  limit:100 });
      const inactive = await getCoupons({ restaurantID:selectedRestaurantId, isActive:false, limit:100 });
      setAllCoupons([...(active.data.data||[]), ...(inactive.data.data||[])]);
      setCoupons(active.data.data||[]);
    } catch {}
    finally { setLoading(false); }
  };
 
  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      codigo: coupon.codigo||'', descripcion: coupon.descripcion||'', tipo: coupon.tipo||'PORCENTAJE',
      porcentajeDescuento: coupon.porcentajeDescuento||0, montoFijo: coupon.montoFijo||0,
      fechaExpiracion: coupon.fechaExpiracion ? new Date(coupon.fechaExpiracion).toISOString().slice(0,10) : '',
      fechaInicio: coupon.fechaInicio ? new Date(coupon.fechaInicio).toISOString().slice(0,10) : '',
      usosMaximos: coupon.usosMaximos||0, montoMinimo: coupon.montoMinimo||0,
      montoMaximoDescuento: coupon.montoMaximoDescuento||0,
    });
    window.scrollTo({ top:0, behavior:'smooth' });
  };
 
  const handleToggleActive = async (coupon) => {
    try {
      setLoading(true);
      if (coupon.isActive) { await deactivateCoupon(coupon._id); toast.success('Cupón desactivado'); }
      else                 { await activateCoupon(coupon._id);   toast.success('Cupón activado'); }
      await refreshCoupons();
    } catch (err) { toast.error(err?.response?.data?.message||'Error al cambiar estado del cupón'); }
    finally { setLoading(false); }
  };
 
  const handleFormChange = (key, value) => setForm(s => ({ ...s, [key]:value }));
 
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        codigo: form.codigo.toUpperCase(), descripcion: form.descripcion, tipo: form.tipo,
        porcentajeDescuento: form.tipo==='PORCENTAJE' ? Number(form.porcentajeDescuento) : 0,
        montoFijo: form.tipo==='MONTO_FIJO' ? Number(form.montoFijo) : 0,
        fechaExpiracion: form.fechaExpiracion,
        fechaInicio: form.fechaInicio || undefined,
        usosMaximos: Number(form.usosMaximos) || undefined,
        montoMinimo: Number(form.montoMinimo) || 0,
        montoMaximoDescuento: Number(form.montoMaximoDescuento) || undefined,
        restaurantID: selectedRestaurantId,
      };
      if (editingCoupon) { await updateCoupon(editingCoupon._id, payload); toast.success('Cupón actualizado'); }
      else               { await createCoupon(payload); toast.success('Cupón creado'); }
      setForm({ codigo:'', descripcion:'', tipo:'PORCENTAJE', porcentajeDescuento:0, montoFijo:0, fechaExpiracion:'', fechaInicio:'', usosMaximos:0, montoMinimo:0, montoMaximoDescuento:0 });
      setEditingCoupon(null);
      await refreshCoupons();
    } catch (err) { toast.error(err?.response?.data?.message||'Error al guardar el cupón'); }
    finally { setLoading(false); }
  };
 
  const selectedRestaurant = useMemo(() => restaurants.find(r => r._id===selectedRestaurantId), [restaurants, selectedRestaurantId]);
  const isAdmin = user && (user.role==='RESTAURANT_ADMIN' || user.role==='PLATFORM_ADMIN');
  const visibleCoupons = isAdmin ? allCoupons : coupons;
 
  /* ── VISTA: Seleccionar restaurante ── */
  if (!selectedRestaurantId) {
    return (
      <div className="cp-root">
        <header className="cp-header">
          <div className="cp-header-inner">
            <div>
              <h1 className="cp-header-title">Cupones disponibles</h1>
              <p className="cp-header-sub">{user?.name}, selecciona un restaurante para ver sus cupones vigentes</p>
            </div>
            <div className="cp-header-actions">
              <button onClick={() => navigate('/cliente')} className="cp-btn-back">
                <i className="ti ti-arrow-left" aria-hidden="true" />Menú Principal
              </button>
            </div>
          </div>
        </header>
        <main className="cp-main">
          <h2 className="cp-section-title">Selecciona un restaurante</h2>
          {restaurants.length === 0 ? (
            <div className="cp-empty-box">
              <span className="cp-empty-box-icon">🏷️</span>
              <div className="cp-empty-box-title">No hay restaurantes disponibles</div>
            </div>
          ) : (
            <div className="cp-restaurant-grid">
              {restaurants.map((restaurant, idx) => (
                <button key={restaurant._id} onClick={() => setSelectedRestaurantId(restaurant._id)} className="cp-restaurant-card" style={{ animationDelay:`${idx*.05}s` }}>
                  <div className="cp-restaurant-img">
                    {restaurant.fotos?.length > 0
                      ? <img src={restaurant.fotos[0]} alt={restaurant.name} />
                      : <div className="cp-restaurant-no-img">🏷️</div>}
                  </div>
                  <div className="cp-restaurant-body">
                    <div className="cp-restaurant-name">{restaurant.name}</div>
                    {restaurant.category && <div className="cp-restaurant-cat">{restaurant.category}</div>}
                    {(restaurant.address||restaurant.direccion) && (
                      <div className="cp-restaurant-addr">
                        <i className="ti ti-map-pin" aria-hidden="true" />
                        {restaurant.address||restaurant.direccion}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }
 
  /* ── VISTA: Cupones del restaurante ── */
  return (
    <div className="cp-root">
      <header className="cp-header">
        <div className="cp-header-inner">
          <div>
            <h1 className="cp-header-title">{selectedRestaurant?.name||'Cupones vigentes'}</h1>
            <p className="cp-header-sub">Promociones disponibles para clientes</p>
          </div>
          <div className="cp-header-actions">
            <button onClick={() => setSelectedRestaurantId(null)} className="cp-btn-back cp-btn-back--gold">
              <i className="ti ti-arrow-left" aria-hidden="true" />Cambiar Restaurante
            </button>
            <button onClick={() => navigate('/cliente')} className="cp-btn-back">
              <i className="ti ti-arrow-left" aria-hidden="true" />Menú Principal
            </button>
          </div>
        </div>
      </header>
 
      <main className="cp-main">
 
        {/* Panel crear/editar — solo admin */}
        {isAdmin && (
          <div className="cp-form-panel">
            <div className="cp-form-panel-title">{editingCoupon ? 'Editar Cupón' : 'Crear Cupón'}</div>
            <form onSubmit={handleSubmitForm}>
              <div className="cp-form-grid">
                <div className="cp-form-field">
                  <label className="cp-form-label">Código <span className="cp-form-label-req">*</span></label>
                  <input value={form.codigo} onChange={e => handleFormChange('codigo',e.target.value)} required className="cp-form-input" placeholder="VERANO25" />
                </div>
                <div className="cp-form-field">
                  <label className="cp-form-label">Tipo <span className="cp-form-label-req">*</span></label>
                  <select value={form.tipo} onChange={e => handleFormChange('tipo',e.target.value)} className="cp-form-select">
                    <option value="PORCENTAJE">Porcentaje</option>
                    <option value="MONTO_FIJO">Monto fijo</option>
                  </select>
                </div>
                <div className="cp-form-field">
                  <label className="cp-form-label">Valor <span className="cp-form-label-req">*</span></label>
                  {form.tipo==='PORCENTAJE'
                    ? <input type="number" min="0" max="100" value={form.porcentajeDescuento} onChange={e => handleFormChange('porcentajeDescuento',e.target.value)} className="cp-form-input" placeholder="10" />
                    : <input type="number" min="0" step="0.01" value={form.montoFijo} onChange={e => handleFormChange('montoFijo',e.target.value)} className="cp-form-input" placeholder="25.00" />}
                </div>
                <div className="cp-form-field">
                  <label className="cp-form-label">Expiración <span className="cp-form-label-req">*</span></label>
                  <input type="date" value={form.fechaExpiracion} onChange={e => handleFormChange('fechaExpiracion',e.target.value)} required className="cp-form-input" />
                </div>
                <div className="cp-form-field cp-form-field--wide">
                  <label className="cp-form-label">Descripción</label>
                  <textarea value={form.descripcion} onChange={e => handleFormChange('descripcion',e.target.value)} className="cp-form-textarea" rows={2} placeholder="Descripción del cupón..." />
                </div>
                <div className="cp-form-field cp-form-actions" style={{ alignSelf:'flex-end' }}>
                  <button type="button" onClick={() => { setEditingCoupon(null); setForm({ codigo:'', descripcion:'', tipo:'PORCENTAJE', porcentajeDescuento:0, montoFijo:0, fechaExpiracion:'', fechaInicio:'', usosMaximos:0, montoMinimo:0, montoMaximoDescuento:0 }); }} className="cp-btn-cancel-form">Cancelar</button>
                  <button type="submit" className="cp-btn-submit">{editingCoupon ? 'Guardar' : 'Crear Cupón'}</button>
                </div>
              </div>
            </form>
          </div>
        )}
 
        {/* Cupones */}
        {loading ? (
          <div className="cp-loading"><div className="cp-spinner" />Cargando cupones...</div>
        ) : visibleCoupons.length === 0 ? (
          <div className="cp-no-coupons">
            <span className="cp-no-coupons-icon">🏷️</span>
            <div className="cp-no-coupons-title">No hay cupones vigentes</div>
            <div className="cp-no-coupons-sub">Vuelve pronto para revisar nuevas promociones disponibles.</div>
            <button onClick={() => setSelectedRestaurantId(null)} className="cp-btn-change-rest">
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Seleccionar otro restaurante
            </button>
          </div>
        ) : (
          <div className="cp-coupons-grid">
            {visibleCoupons.map((coupon, idx) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                delay={idx * 0.05}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
 