import { useEffect, useState } from 'react';
import { useOrderCartStore } from '../../store/useOrderCartStore.js';
import { useOrderStore } from '../../store/useOrderStore.js';
import { validateCoupon } from '../../../../shared/api/couponService.js';
import { notyfError, notyfSuccess } from '../../../../shared/utils/notyf.js';
 
const PAYMENT_METHODS = [
  { value:'EFECTIVO',      label:'Efectivo' },
  { value:'TARJETA',       label:'Tarjeta' },
  { value:'TRANSFERENCIA', label:'Transferencia' },
];
 
export const StepConfirmOrder = ({ onClose }) => {
  const cart       = useOrderCartStore();
  const orderStore = useOrderStore();
 
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [isCreatingOrder,   setIsCreatingOrder]   = useState(false);
  const [couponInput,       setCouponInput]        = useState('');
  const [couponMessage,     setCouponMessage]      = useState('');
  const [couponMessageType, setCouponMessageType]  = useState('');
  const [isValidatingCoupon,setIsValidatingCoupon] = useState(false);
  const [addressInput,      setAddressInput]       = useState('');
  const [scheduledTime,     setScheduledTime]      = useState('');
 
  const subtotal = cart.getSubtotal();
  const discount = cart.getDiscount();
  const tax      = cart.getTax();
  const total    = cart.getTotal();
 
  /* ── Handlers — INTACTOS ── */
  const handleValidateStock = async () => {
    if (!cart.clientName || !cart.clientPhone) { notyfError('Ingresa nombre y teléfono'); return; }
    setIsValidatingStock(true);
    const res = await orderStore.checkStock(cart.restaurantId, cart.items);
    setIsValidatingStock(false);
    if (!res.success) {
      const faltantes = res.faltantes || [];
      notyfError(faltantes.length > 0 ? `Sin stock: ${faltantes.map(f=>f.nombre).join(', ')}` : res.error);
      return;
    }
    notyfSuccess('✓ Stock disponible. Procede a confirmar tu pedido');
  };
 
  const handleValidateCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponMessage('Ingresa un código de cupón'); setCouponMessageType('error'); notyfError('Ingresa un código de cupón'); return; }
    if (!cart.restaurantId) { setCouponMessage('No se pudo identificar el restaurante'); setCouponMessageType('error'); notyfError('No se pudo identificar el restaurante'); return; }
    setIsValidatingCoupon(true); setCouponMessage(''); setCouponMessageType('');
    try {
      const res = await validateCoupon({ codigo: code, montoTotal: subtotal, restaurantID: cart.restaurantId });
      const desc = Number(res.data?.data?.descuento || 0);
      useOrderCartStore.setState({ couponCode: code, discount: desc, discountType:'FIXED_AMOUNT' });
      setCouponMessage(`Cupón aplicado. Descuento: Q${desc.toFixed(2)}`); setCouponMessageType('success');
      notyfSuccess('Cupón aplicado correctamente');
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo validar el cupón';
      useOrderCartStore.setState({ couponCode:'', discount:0, discountType:'' });
      setCouponMessage(msg); setCouponMessageType('error'); notyfError(msg);
    } finally { setIsValidatingCoupon(false); }
  };
 
  const handleCreateOrder = async () => {
    if (!cart.clientName?.trim())  { notyfError('Nombre es obligatorio'); return; }
    if (!cart.clientPhone?.trim()) { notyfError('Teléfono es obligatorio'); return; }
    if (cart.orderType==='A_DOMICILIO' && !addressInput.trim()) { notyfError('Dirección es obligatoria'); return; }
    if (cart.orderType==='PARA_LLEVAR' && !scheduledTime)       { notyfError('Selecciona hora de retiro'); return; }
 
    const orderData = {
      tipoPedido: cart.orderType, restaurantId: cart.restaurantId,
      items: cart.items.map(item => ({ tipo:item.tipo, [item.tipo==='PLATO'?'plato':'menu']:item.id, cantidad:item.cantidad, notas:'' })),
      clienteNombre: cart.clientName, clienteTelefono: cart.clientPhone,
      clienteEmail: cart.clientEmail || undefined,
      ...(cart.orderType==='EN_MESA'     && { mesaID: cart.selectedMesa?._id }),
      ...(cart.orderType==='A_DOMICILIO' && { clienteDireccion: addressInput }),
      ...(cart.orderType==='PARA_LLEVAR' && { horaProgramada: scheduledTime }),
      subtotal, descuento: discount>0?discount:undefined, impuesto:tax, total,
      ...(cart.couponCode ? { couponCode:cart.couponCode } : {}),
    };
 
    setIsCreatingOrder(true);
    try {
      const checkRes = await orderStore.checkEvents({ restaurantId:cart.restaurantId, items:orderData.items });
      if (checkRes.success && checkRes.data?.data?.evento) {
        const evt = checkRes.data.data.evento;
        const descPrev = Number(checkRes.data.data.descuento||0);
        const msg = `Promoción activa: ${evt.nombre} — ${evt.descripcion}.\nDescuento estimado: Q${descPrev.toFixed(2)}.\nTotal estimado: Q${(subtotal-descPrev+tax).toFixed(2)}\n\n¿Aplicar promoción y continuar?`;
        if (!window.confirm(msg)) { setIsCreatingOrder(false); return; }
      }
      const res = await orderStore.createOrderAction(orderData);
      setIsCreatingOrder(false);
      if (res.success) { notyfSuccess('✓ Su pedido fue hecho exitosamente'); cart.resetCart(); setTimeout(()=>onClose(),1500); }
      else notyfError(res.error || 'Error al crear pedido');
    } catch (err) { setIsCreatingOrder(false); notyfError(err?.message||'Error al comprobar promociones'); }
  };
 
  return (
    <div style={{ position:'relative' }}>
 
      {/* Resumen */}
      <div className="or-confirm-section">
        <div className="or-confirm-section-title"><i className="ti ti-receipt" aria-hidden="true" />Resumen del pedido</div>
        <div className="or-cart-box" style={{ marginBottom:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(200,140,40,.08)', borderRadius:8, padding:'8px 12px', marginBottom:10, fontSize:12, fontWeight:500, color:'var(--or-gold)' }}>
            <span>Tipo:</span>
            <span>{cart.orderType==='EN_MESA'?`🪑 Mesa ${cart.selectedMesa?.numero}`:cart.orderType==='A_DOMICILIO'?'🚗 A Domicilio':'📦 Para Llevar'}</span>
          </div>
          <div className="or-cart-items" style={{ maxHeight:120 }}>
            {cart.items.map(item => (
              <div key={`${item.tipo}-${item.id}`} className="or-cart-item">
                <div className="or-cart-item-info">
                  <div className="or-cart-item-name">{item.nombre}</div>
                  <div className="or-cart-item-sub">{item.cantidad}x Q{item.precioUnitario.toFixed(2)}</div>
                </div>
                <span className="or-cart-item-total">Q{(item.cantidad*item.precioUnitario).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="or-totals">
            <div className="or-total-row"><span>Subtotal</span><span className="or-total-val">Q{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="or-total-row or-total-row--discount"><span>Descuento</span><span>-Q{discount.toFixed(2)}</span></div>}
            <div className="or-total-row"><span>Impuesto (19%)</span><span className="or-total-val">Q{tax.toFixed(2)}</span></div>
            <div className="or-total-row or-total-row--final"><span>Total a Pagar</span><span className="or-total-val">Q{total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
 
      {/* Datos del cliente */}
      <div className="or-confirm-section">
        <div className="or-confirm-section-title"><i className="ti ti-user" aria-hidden="true" />Tus datos</div>
        <div className="or-form-row" style={{ marginBottom:10 }}>
          <div className="or-form-field">
            <label className="or-form-label">Nombre <span className="or-form-label-req">*</span></label>
            <input type="text" value={cart.clientName} onChange={e => useOrderCartStore.setState({clientName:e.target.value})} placeholder="Tu nombre completo" className="or-form-input" />
          </div>
          <div className="or-form-field">
            <label className="or-form-label">Teléfono <span className="or-form-label-req">*</span></label>
            <input type="tel" value={cart.clientPhone} onChange={e => useOrderCartStore.setState({clientPhone:e.target.value})} placeholder="Tu teléfono" className="or-form-input" />
          </div>
        </div>
        <div className="or-form-field">
          <label className="or-form-label">Email (opcional)</label>
          <input type="email" value={cart.clientEmail} onChange={e => useOrderCartStore.setState({clientEmail:e.target.value})} placeholder="tu@email.com" className="or-form-input" />
        </div>
        {cart.orderType==='A_DOMICILIO' && (
          <div className="or-form-field" style={{ marginTop:10 }}>
            <label className="or-form-label">Dirección de entrega <span className="or-form-label-req">*</span></label>
            <textarea value={addressInput} onChange={e => setAddressInput(e.target.value)} placeholder="Calle, número, apartamento, referencias..." className="or-form-textarea" rows={2} />
          </div>
        )}
        {cart.orderType==='PARA_LLEVAR' && (
          <div className="or-form-field" style={{ marginTop:10 }}>
            <label className="or-form-label">Hora de retiro <span className="or-form-label-req">*</span></label>
            <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="or-form-input" />
          </div>
        )}
      </div>
 
      {/* Cupón */}
      <div className="or-confirm-section">
        <div className="or-confirm-section-title"><i className="ti ti-tag" aria-hidden="true" />Código de Cupón (opcional)</div>
        <div className="or-coupon-row">
          <input type="text" value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponMessage(''); setCouponMessageType(''); useOrderCartStore.setState({couponCode:'',discount:0,discountType:''}); }} placeholder="Ingresa tu cupón" className="or-coupon-input" />
          <button onClick={handleValidateCoupon} disabled={isValidatingCoupon} className="or-coupon-btn">
            {isValidatingCoupon ? 'Validando...' : 'Aplicar'}
          </button>
        </div>
        {couponMessage && (
          <div className={couponMessageType==='success' ? 'or-coupon-ok' : 'or-coupon-err'} style={{ marginTop:6 }}>
            <i className={`ti ${couponMessageType==='success'?'ti-circle-check':'ti-alert-circle'}`} aria-hidden="true" />
            {couponMessage}
          </div>
        )}
      </div>
 
      {/* Notas */}
      <div className="or-confirm-section">
        <div className="or-confirm-section-title"><i className="ti ti-notes" aria-hidden="true" />Notas especiales (opcional)</div>
        <textarea value={cart.notes} onChange={e => useOrderCartStore.setState({notes:e.target.value})} placeholder="Alergias, preferencias, indicaciones especiales..." className="or-form-textarea" rows={2} />
      </div>
 
      {/* Error */}
      {orderStore.error && (
        <div style={{ background:'rgba(200,80,80,.10)', border:'.5px solid rgba(200,80,80,.25)', borderRadius:9, padding:'10px 14px', marginBottom:12, fontSize:12, color:'var(--or-red)' }}>
          <strong>Error:</strong> {orderStore.error}
        </div>
      )}
 
      {/* Nav */}
      <div className="or-step-nav">
        <button onClick={() => useOrderCartStore.setState({currentStep:2})} disabled={isValidatingStock||isCreatingOrder} className="or-step-nav-btn or-step-nav-back">← Atrás</button>
        <button onClick={handleValidateStock} disabled={isValidatingStock||isCreatingOrder} className="or-step-nav-btn or-step-nav-validate">
          {isValidatingStock ? '⏳ Validando...' : '✓ Validar Stock'}
        </button>
        <button onClick={handleCreateOrder} disabled={isCreatingOrder||isValidatingStock} className="or-step-nav-btn or-step-nav-next">
          {isCreatingOrder ? '⏳ Creando...' : '✓ Confirmar'}
        </button>
      </div>
 
      {/* Overlay de carga */}
      {isCreatingOrder && (
        <div style={{ position:'absolute', inset:0, background:'rgba(17,16,9,.8)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12 }}>
          <div style={{ background:'var(--or-bg-panel)', border:'.5px solid var(--or-border)', borderRadius:12, padding:'16px 24px', display:'flex', alignItems:'center', gap:12 }}>
            <div className="or-table-spinner" style={{ width:20, height:20 }} />
            <span style={{ fontSize:13, color:'var(--or-text-primary)', fontWeight:500 }}>Creando pedido...</span>
          </div>
        </div>
      )}
    </div>
  );
};
 