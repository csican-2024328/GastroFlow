import { useEffect, useState } from 'react';
import { useOrderCartStore } from '../../store/useOrderCartStore.js';
import { useOrderStore } from '../../store/useOrderStore.js';
import { notyfError, notyfSuccess } from '../../../../shared/utils/notyf.js';

export const StepConfirmOrder = ({ onClose }) => {
  const cart = useOrderCartStore();
  const orderStore = useOrderStore();

  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  const subtotal = cart.getSubtotal();
  const discount = cart.getDiscount();
  const tax = cart.getTax();
  const total = cart.getTotal();

  // Show additional fields based on order type
  useEffect(() => {
    if (cart.orderType !== 'EN_MESA') {
      setShowAdditionalFields(true);
    }
  }, [cart.orderType]);

  const handleValidateStock = async () => {
    if (!cart.clientName || !cart.clientPhone) {
      notyfError('Ingresa nombre y teléfono');
      return;
    }

    setIsValidatingStock(true);
    const response = await orderStore.checkStock(cart.restaurantId, cart.items);
    setIsValidatingStock(false);

    if (!response.success) {
      const faltantes = response.faltantes || [];
      const message =
        faltantes.length > 0
          ? `Sin stock: ${faltantes.map((f) => f.nombre).join(', ')}`
          : response.error;
      notyfError(message);
      return;
    }

    notyfSuccess('✓ Stock disponible. Procede a confirmar tu pedido');
  };

  const handleCreateOrder = async () => {
    // Validate required fields
    if (!cart.clientName?.trim()) {
      notyfError('Nombre es obligatorio');
      return;
    }

    if (!cart.clientPhone?.trim()) {
      notyfError('Teléfono es obligatorio');
      return;
    }

    if (cart.orderType === 'A_DOMICILIO' && !addressInput.trim()) {
      notyfError('Dirección de entrega es obligatoria');
      return;
    }

    if (cart.orderType === 'PARA_LLEVAR' && !scheduledTime) {
      notyfError('Selecciona hora de retiro');
      return;
    }

    // Build order data
    const orderData = {
      tipoPedido: cart.orderType,
      restaurantId: cart.restaurantId,
      items: cart.items.map((item) => ({
        tipo: item.tipo,
        [item.tipo === 'PLATO' ? 'plato' : 'menu']: item.id,
        cantidad: item.cantidad,
        notas: '',
      })),
      clienteNombre: cart.clientName,
      clienteTelefono: cart.clientPhone,
      clienteEmail: cart.clientEmail || undefined,
      ...(cart.orderType === 'EN_MESA' && { mesaID: cart.selectedMesa?._id }),
      ...(cart.orderType === 'A_DOMICILIO' && { clienteDireccion: addressInput }),
      ...(cart.orderType === 'PARA_LLEVAR' && { horaProgramada: scheduledTime }),
      subtotal,
      descuento: discount > 0 ? discount : undefined,
      impuesto: tax,
      total,
      ...(couponInput && { cupon: couponInput }),
    };

    // Check for events/promotions before creating order
    setIsCreatingOrder(true);
    try {
      const checkRes = await orderStore.checkEvents({ restaurantId: cart.restaurantId, items: orderData.items });
      if (checkRes.success && checkRes.data && checkRes.data.data && checkRes.data.data.evento) {
        const evt = checkRes.data.data.evento;
        const descuentoPreview = Number(checkRes.data.data.descuento || 0);
        const mensaje = `Este restaurante tiene una promoción activa: ${evt.nombre} — ${evt.descripcion}.\nDescuento estimado: $${descuentoPreview.toFixed(2)}.\n\nSubtotal: $${subtotal.toFixed(2)}\nDescuento: -$${descuentoPreview.toFixed(2)}\nImpuesto: $${tax.toFixed(2)}\nTotal estimado: $${(subtotal - descuentoPreview + tax).toFixed(2)}\n\n¿Deseas aplicar la promoción y continuar?`;
        const aceptar = window.confirm(mensaje);
        if (!aceptar) {
          setIsCreatingOrder(false);
          return;
        }
      }

      const response = await orderStore.createOrderAction(orderData);
      setIsCreatingOrder(false);

      if (response.success) {
        notyfSuccess('✓ Su pedido fue hecho exitosamente');
        cart.resetCart();
        setTimeout(() => onClose(), 1500);
      } else {
        notyfError(response.error || 'Error al crear pedido');
      }
    } catch (err) {
      setIsCreatingOrder(false);
      notyfError(err?.message || 'Error al comprobar promociones');
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gradient-to-br from-[#FFF8F0] to-[#F8F5F0] border border-[#E2D4B7] rounded-lg p-6">
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Resumen de tu Pedido</h3>

        <div className="space-y-3 mb-4">
          {/* Order Type */}
          <div className="flex justify-between items-center p-2 bg-white rounded border border-[#E2D4B7]">
            <span className="text-[#4b4b4b] font-semibold">Tipo:</span>
            <span className="font-semibold text-[#D4984E]">
              {cart.orderType === 'EN_MESA'
                ? `🪑 Mesa ${cart.selectedMesa?.numero}`
                : cart.orderType === 'A_DOMICILIO'
                ? '🚗 A Domicilio'
                : '📦 Para Llevar'}
            </span>
          </div>

          {/* Items */}
          <div className="bg-white rounded border border-[#E2D4B7] p-3 max-h-40 overflow-y-auto">
            <p className="font-semibold text-[#1A1A1A] mb-2">Artículos:</p>
            {cart.items.map((item) => (
              <div
                key={`${item.tipo}-${item.id}`}
                className="flex justify-between text-sm py-1 border-b border-[#E2D4B7] last:border-0"
              >
                <span className="text-[#4b4b4b]">
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="font-semibold">${(item.cantidad * item.precioUnitario).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-white rounded border border-[#E2D4B7] p-3 space-y-2">
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
            <div className="flex justify-between font-bold text-lg border-t border-[#E2D4B7] pt-2">
              <span>Total a Pagar:</span>
              <span className="text-[#D4984E]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-[#1A1A1A]">Tus Datos</h3>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            Nombre *
          </label>
          <input
            type="text"
            value={cart.clientName}
            onChange={(e) =>
              useOrderCartStore.setState({ clientName: e.target.value })
            }
            placeholder="Tu nombre completo"
            className="w-full px-4 py-2 border border-[#E2D4B7] rounded-lg focus:outline-none focus:border-[#D4984E] bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            value={cart.clientPhone}
            onChange={(e) =>
              useOrderCartStore.setState({ clientPhone: e.target.value })
            }
            placeholder="Tu teléfono"
            className="w-full px-4 py-2 border border-[#E2D4B7] rounded-lg focus:outline-none focus:border-[#D4984E] bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            Email (Opcional)
          </label>
          <input
            type="email"
            value={cart.clientEmail}
            onChange={(e) =>
              useOrderCartStore.setState({ clientEmail: e.target.value })
            }
            placeholder="tu@email.com"
            className="w-full px-4 py-2 border border-[#E2D4B7] rounded-lg focus:outline-none focus:border-[#D4984E] bg-white"
          />
        </div>

        {/* Conditional Fields */}
        {cart.orderType === 'A_DOMICILIO' && (
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Dirección de Entrega *
            </label>
            <textarea
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Calle, número, apartamento, referencias..."
              rows="3"
              className="w-full px-4 py-2 border border-[#E2D4B7] rounded-lg focus:outline-none focus:border-[#D4984E] bg-white"
            />
          </div>
        )}

        {cart.orderType === 'PARA_LLEVAR' && (
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Hora de Retiro *
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-2 border border-[#E2D4B7] rounded-lg focus:outline-none focus:border-[#D4984E] bg-white"
            />
          </div>
        )}
      </div>

      {/* Coupon Section */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#1A1A1A]">
          Código de Cupón (Opcional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Ingresa tu cupón"
            className="flex-1 px-4 py-2 border border-[#E2D4B7] rounded-lg focus:outline-none focus:border-[#D4984E] bg-white"
          />
          <button className="px-4 py-2 bg-[#E2D4B7] text-[#1A1A1A] rounded-lg hover:bg-[#d8c8a6] transition-colors font-semibold">
            Validar
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
          Notas Especiales (Opcional)
        </label>
        <textarea
          value={cart.notes}
          onChange={(e) => useOrderCartStore.setState({ notes: e.target.value })}
          placeholder="Alergias, preferencias, indicaciones especiales..."
          rows="2"
          className="w-full px-4 py-2 border border-[#E2D4B7] rounded-lg focus:outline-none focus:border-[#D4984E] bg-white"
        />
      </div>

      {/* Error Messages */}
      {orderStore.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{orderStore.error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={() => useOrderCartStore.setState({ currentStep: 2 })}
          className="flex-1 px-4 py-3 border border-[#d8c8a6] text-[#1A1A1A] rounded-lg hover:bg-[#F8F5F0] transition-colors font-semibold disabled:opacity-50"
          disabled={isValidatingStock || isCreatingOrder}
        >
          ← Atrás
        </button>

        <button
          onClick={handleValidateStock}
          disabled={isValidatingStock || isCreatingOrder}
          className="flex-1 px-4 py-3 bg-[#E2D4B7] text-[#1A1A1A] rounded-lg hover:bg-[#d8c8a6] transition-colors font-semibold disabled:opacity-50"
        >
          {isValidatingStock ? '⏳ Validando...' : '✓ Validar Stock'}
        </button>

        <button
          onClick={handleCreateOrder}
          disabled={isCreatingOrder || isValidatingStock}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D4984E] to-[#B8860B] text-white rounded-lg hover:from-[#C2852D] hover:to-[#A67C09] transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isCreatingOrder ? '⏳ Creando...' : '✓ Confirmar Pedido'}
        </button>
      </div>

      <p className="text-xs text-[#4b4b4b] text-center">
        Los campos marcados con * son obligatorios
      </p>
    </div>
  );
};
