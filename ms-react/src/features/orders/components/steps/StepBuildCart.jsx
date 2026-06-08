import { useEffect, useState } from 'react';
import { useOrderCartStore } from '../../store/useOrderCartStore.js';
import { useDishStore } from '../../../dishes/store/useDishStore.js';
import { useMenuStore } from '../../../dishes/store/useMenuStore.js';
import { notyfError, notyfSuccess } from '../../../../shared/utils/notyf.js';
 
export const StepBuildCart = () => {
  const restaurantId      = useOrderCartStore((s) => s.restaurantId);
  const items             = useOrderCartStore((s) => s.items);
  const addItem           = useOrderCartStore((s) => s.addItem);
  const removeItem        = useOrderCartStore((s) => s.removeItem);
  const setCurrentStep    = useOrderCartStore((s) => s.setCurrentStep);
 
  const dishes            = useDishStore((s) => s.dishes);
  const dishesLoading     = useDishStore((s) => s.loading);
  const fetchDishes       = useDishStore((s) => s.fetchDishes);
 
  const menus             = useMenuStore((s) => s.menus);
  const menusLoading      = useMenuStore((s) => s.loading);
  const fetchActiveMenus  = useMenuStore((s) => s.fetchActiveMenus);
 
  const [selectedTab, setSelectedTab] = useState('platos');
  const [quantity, setQuantity]       = useState({});
 
  useEffect(() => {
    if (restaurantId) { fetchDishes(restaurantId); fetchActiveMenus(restaurantId); }
  }, [restaurantId, fetchDishes, fetchActiveMenus]);
 
  const handleAddItem = (item, tipo) => {
    const qty = quantity[`${tipo}-${item._id}`] || 1;
    if (qty <= 0) { notyfError('Cantidad debe ser mayor a 0'); return; }
    addItem({ tipo, id: item._id, nombre: item.nombre, precioUnitario: tipo==='PLATO' ? Number(item.precio||0) : Number(item.precioMenu??item.precio??0), cantidad: qty });
    notyfSuccess(`${item.nombre} agregado al carrito`);
    setQuantity(prev => ({ ...prev, [`${tipo}-${item._id}`]: 1 }));
  };
 
  const handleRemoveItem = (tipo, id) => { removeItem(tipo, id); notyfSuccess('Artículo removido'); };
 
  const handleNext = () => {
    if (items.length === 0) { notyfError('Agrega al menos un artículo'); return; }
    setCurrentStep(3);
  };
 
  const subtotal = useOrderCartStore((s) => s.getSubtotal());
  const discount = useOrderCartStore((s) => s.getDiscount());
  const tax      = useOrderCartStore((s) => s.getTax());
  const total    = useOrderCartStore((s) => s.getTotal());
 
  return (
    <div>
      {/* Tabs */}
      <div className="or-tabs">
        {[
          { id:'platos', label:'Platos',  icon:'🍽️', count:dishes.length },
          { id:'menus',  label:'Menús',   icon:'📋', count:menus.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setSelectedTab(tab.id)} className={`or-tab${selectedTab===tab.id?' active':''}`}>
            {tab.icon} {tab.label} ({tab.count})
          </button>
        ))}
      </div>
 
      {/* Catálogo */}
      <div className="or-catalog-grid">
        {selectedTab === 'platos' && (dishesLoading ? (
          <div style={{ gridColumn:'span 2' }} className="cl-loading-text"><div className="or-table-spinner" />Cargando platos...</div>
        ) : dishes.length === 0 ? (
          <div style={{ gridColumn:'span 2', textAlign:'center', padding:'24px 0', color:'var(--or-text-hint)', fontSize:12 }}>No hay platos disponibles</div>
        ) : dishes.map(dish => (
          <div key={dish._id} className="or-catalog-item">
            <div className="or-catalog-item-header">
              <div className="or-catalog-name">{dish.nombre}</div>
              <div className="or-catalog-price">Q{dish.precio.toFixed(2)}</div>
            </div>
            {dish.descripcion && <div className="or-catalog-desc">{dish.descripcion}</div>}
            <div className="or-catalog-actions">
              <input type="number" min="1" value={quantity[`PLATO-${dish._id}`]||1} onChange={e => setQuantity(p=>({...p,[`PLATO-${dish._id}`]:parseInt(e.target.value)||1}))} className="or-qty-input" />
              <button onClick={() => handleAddItem(dish,'PLATO')} className="or-add-btn">
                <i className="ti ti-plus" aria-hidden="true" /> Agregar
              </button>
            </div>
          </div>
        )))}
 
        {selectedTab === 'menus' && (menusLoading ? (
          <div style={{ gridColumn:'span 2' }} className="cl-loading-text"><div className="or-table-spinner" />Cargando menús...</div>
        ) : menus.length === 0 ? (
          <div style={{ gridColumn:'span 2', textAlign:'center', padding:'24px 0', color:'var(--or-text-hint)', fontSize:12 }}>No hay menús disponibles</div>
        ) : menus.map(menu => (
          <div key={menu._id} className="or-catalog-item">
            <div className="or-catalog-item-header">
              <div className="or-catalog-name">{menu.nombre}</div>
              <div className="or-catalog-price">Q{Number(menu.precio??menu.precioMenu??0).toFixed(2)}</div>
            </div>
            {menu.descripcion && <div className="or-catalog-desc">{menu.descripcion}</div>}
            {menu.platos?.length > 0 && <div className="or-catalog-includes">Incluye: {menu.platos.map(p=>p.nombre||p.name).filter(Boolean).join(', ')}</div>}
            <div className="or-catalog-actions">
              <input type="number" min="1" value={quantity[`MENU-${menu._id}`]||1} onChange={e => setQuantity(p=>({...p,[`MENU-${menu._id}`]:parseInt(e.target.value)||1}))} className="or-qty-input" />
              <button onClick={() => handleAddItem(menu,'MENU')} className="or-add-btn">
                <i className="ti ti-plus" aria-hidden="true" /> Agregar
              </button>
            </div>
          </div>
        )))}
      </div>
 
      {/* Carrito */}
      <div className="or-cart-box">
        <div className="or-cart-title"><i className="ti ti-shopping-cart" aria-hidden="true" />Tu Carrito</div>
        {items.length === 0 ? (
          <p className="or-cart-empty">No hay artículos en el carrito</p>
        ) : (
          <>
            <div className="or-cart-items">
              {items.map(item => (
                <div key={`${item.tipo}-${item.id}`} className="or-cart-item">
                  <div className="or-cart-item-info">
                    <div className="or-cart-item-name">{item.nombre}</div>
                    <div className="or-cart-item-sub">{item.cantidad}x Q{item.precioUnitario.toFixed(2)}</div>
                  </div>
                  <div className="or-cart-item-right">
                    <span className="or-cart-item-total">Q{(item.cantidad*item.precioUnitario).toFixed(2)}</span>
                    <button onClick={() => handleRemoveItem(item.tipo,item.id)} className="or-cart-remove" aria-label="Eliminar">
                      <i className="ti ti-x" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="or-totals">
              <div className="or-total-row"><span>Subtotal</span><span className="or-total-val">Q{subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="or-total-row or-total-row--discount"><span>Descuento</span><span>-Q{discount.toFixed(2)}</span></div>}
              <div className="or-total-row"><span>Impuesto (19%)</span><span className="or-total-val">Q{tax.toFixed(2)}</span></div>
              <div className="or-total-row or-total-row--final"><span>Total</span><span className="or-total-val">Q{total.toFixed(2)}</span></div>
            </div>
          </>
        )}
      </div>
 
      <div className="or-step-nav">
        <button onClick={() => useOrderCartStore.setState({ currentStep:1 })} className="or-step-nav-btn or-step-nav-back">← Atrás</button>
        <button onClick={handleNext} className="or-step-nav-btn or-step-nav-next">Siguiente →</button>
      </div>
    </div>
  );
};
 