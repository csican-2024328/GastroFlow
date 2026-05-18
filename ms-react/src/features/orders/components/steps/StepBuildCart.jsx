import { useEffect, useState } from 'react';
import { useOrderCartStore } from '../../store/useOrderCartStore.js';
import { useDishStore } from '../../../dishes/store/useDishStore.js';
import { useMenuStore } from '../../../dishes/store/useMenuStore.js';
import { notyfError, notyfSuccess } from '../../../../shared/utils/notyf.js';

export const StepBuildCart = () => {
  const restaurantId = useOrderCartStore((s) => s.restaurantId);
  const items = useOrderCartStore((s) => s.items);
  const addItem = useOrderCartStore((s) => s.addItem);
  const removeItem = useOrderCartStore((s) => s.removeItem);
  const updateItemQuantity = useOrderCartStore((s) => s.updateItemQuantity);
  const setCurrentStep = useOrderCartStore((s) => s.setCurrentStep);

  const dishes = useDishStore((s) => s.dishes);
  const dishesLoading = useDishStore((s) => s.loading);
  const fetchDishes = useDishStore((s) => s.fetchDishes);

  const menus = useMenuStore((s) => s.menus);
  const menusLoading = useMenuStore((s) => s.loading);
  const fetchActiveMenus = useMenuStore((s) => s.fetchActiveMenus);

  const [selectedCategory, setSelectedCategory] = useState('platos');
  const [quantity, setQuantity] = useState({});

  useEffect(() => {
    if (restaurantId) {
      fetchDishes(restaurantId);
      fetchActiveMenus(restaurantId);
    }
  }, [restaurantId, fetchDishes, fetchActiveMenus]);

  const handleAddItem = (item, tipo) => {
    const qty = quantity[`${tipo}-${item._id}`] || 1;
    if (qty <= 0) {
      notyfError('Cantidad debe ser mayor a 0');
      return;
    }

    addItem({
      tipo,
      id: item._id,
      nombre: item.nombre,
      precioUnitario: tipo === 'PLATO' ? Number(item.precio || 0) : Number(item.precioMenu ?? item.precio ?? 0),
      cantidad: qty,
    });

    notyfSuccess(`${item.nombre} agregado al carrito`);
    setQuantity((prev) => ({ ...prev, [`${tipo}-${item._id}`]: 1 }));
  };

  const handleRemoveItem = (tipo, id) => {
    removeItem(tipo, id);
    notyfSuccess('Artículo removido del carrito');
  };

  const handleNext = () => {
    if (items.length === 0) {
      notyfError('Agrega al menos un artículo');
      return;
    }
    setCurrentStep(3);
  };

  const subtotal = useOrderCartStore((s) => s.getSubtotal());
  const discount = useOrderCartStore((s) => s.getDiscount());
  const tax = useOrderCartStore((s) => s.getTax());
  const total = useOrderCartStore((s) => s.getTotal());

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E2D4B7]">
        {[
          { id: 'platos', label: '🍽️ Platos', count: dishes.length },
          { id: 'menus', label: '📋 Menús', count: menus.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`
              px-4 py-3 font-semibold transition-colors border-b-2
              ${
                selectedCategory === tab.id
                  ? 'text-[#D4984E] border-[#D4984E]'
                  : 'text-[#4b4b4b] border-transparent hover:text-[#D4984E]'
              }
            `}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
        {selectedCategory === 'platos' && (dishesLoading ? (
          <div className="col-span-full text-center py-8">Cargando platos...</div>
        ) : dishes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[#4b4b4b]">
            No hay platos disponibles
          </div>
        ) : (
          dishes.map((dish) => (
            <div
              key={dish._id}
              className="border border-[#E2D4B7] rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-[#1A1A1A]">{dish.nombre}</h4>
                  <p className="text-xs text-[#4b4b4b] mt-1">{dish.descripcion}</p>
                </div>
                <span className="text-[#D4984E] font-bold">${dish.precio.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 items-center mt-4">
                <input
                  type="number"
                  min="1"
                  value={quantity[`PLATO-${dish._id}`] || 1}
                  onChange={(e) =>
                    setQuantity((prev) => ({
                      ...prev,
                      [`PLATO-${dish._id}`]: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-16 px-2 py-1 border border-[#E2D4B7] rounded text-center"
                />
                <button
                  onClick={() => handleAddItem(dish, 'PLATO')}
                  className="flex-1 px-3 py-1 bg-[#D4984E] text-white rounded hover:bg-[#C2852D] transition-colors text-sm font-semibold"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))
        ))}

        {selectedCategory === 'menus' && (menusLoading ? (
          <div className="col-span-full text-center py-8">Cargando menús...</div>
        ) : menus.length === 0 ? (
          <div className="col-span-full text-center py-8 text-[#4b4b4b]">
            No hay menús disponibles
          </div>
        ) : (
          menus.map((menu) => (
            <div
              key={menu._id}
              className="border border-[#E2D4B7] rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-[#1A1A1A]">{menu.nombre}</h4>
                  <p className="text-xs text-[#4b4b4b] mt-1">{menu.descripcion}</p>
                </div>
                <span className="text-[#D4984E] font-bold">${Number(menu.precio ?? menu.precioMenu ?? 0).toFixed(2)}</span>
              </div>

              {menu.platos?.length > 0 && (
                <p className="text-xs text-[#5A5146] leading-5">
                  Incluye: {menu.platos.map((plato) => plato.nombre || plato.name).filter(Boolean).join(', ')}
                </p>
              )}

              <div className="flex gap-2 items-center mt-4">
                <input
                  type="number"
                  min="1"
                  value={quantity[`MENU-${menu._id}`] || 1}
                  onChange={(e) =>
                    setQuantity((prev) => ({
                      ...prev,
                      [`MENU-${menu._id}`]: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-16 px-2 py-1 border border-[#E2D4B7] rounded text-center"
                />
                <button
                  onClick={() => handleAddItem(menu, 'MENU')}
                  className="flex-1 px-3 py-1 bg-[#D4984E] text-white rounded hover:bg-[#C2852D] transition-colors text-sm font-semibold"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))
        ))}
      </div>

      {/* Cart Summary */}
      <div className="space-y-3 bg-[#FFF8F0] border border-[#E2D4B7] rounded-lg p-4">
        <h4 className="font-bold text-[#1A1A1A] mb-3">Tu Carrito</h4>

        {items.length === 0 ? (
          <p className="text-[#4b4b4b] text-sm">No hay artículos en el carrito</p>
        ) : (
          <>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.tipo}-${item.id}`}
                  className="flex justify-between items-center text-sm p-2 bg-white rounded border border-[#E2D4B7]"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1A1A]">{item.nombre}</p>
                    <p className="text-xs text-[#4b4b4b]">
                      {item.cantidad}x ${item.precioUnitario.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#D4984E]">
                      ${(item.cantidad * item.precioUnitario).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.tipo, item.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-[#E2D4B7] pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#4b4b4b]">Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento:</span>
                  <span className="font-semibold">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#4b4b4b]">Impuesto (19%):</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg bg-white p-2 rounded">
                <span>Total:</span>
                <span className="text-[#D4984E]">${total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={() => useOrderCartStore.setState({ currentStep: 1 })}
          className="flex-1 px-4 py-3 border border-[#d8c8a6] text-[#1A1A1A] rounded-lg hover:bg-[#F8F5F0] transition-colors font-semibold"
        >
          ← Atrás
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D4984E] to-[#B8860B] text-white rounded-lg hover:from-[#C2852D] hover:to-[#A67C09] transition-all font-semibold shadow-md hover:shadow-lg"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};
