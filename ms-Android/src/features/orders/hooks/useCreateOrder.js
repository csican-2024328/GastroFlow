import { useCallback } from 'react';
import { useApiRequest } from '../../../shared/hooks/useApiRequest';
import { useOrderCartStore, mapCartItemToOrderPayload, validateOrderFields } from '../../../shared/store/orderCartStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { checkOrderStock, checkOrderEvents, createOrder } from '../../../shared/api/orderApi';

const resolveClienteNombre = (customerName) => {
  const trimmed = customerName?.trim();
  return trimmed || useAuthStore.getState().user?.name;
};

const buildOrderPayload = () => {
  const {
    items,
    restaurantId,
    tipoPedido,
    selectedTable,
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    scheduledTime,
    customerNotes,
    appliedCoupon,
    paymentMethod,
  } = useOrderCartStore.getState();

  return {
    tipoPedido,
    restaurantID: restaurantId,
    mesaID: tipoPedido === 'EN_MESA' ? selectedTable?._id : undefined,
    clienteNombre: resolveClienteNombre(customerName),
    clienteTelefono: customerPhone?.trim() || undefined,
    clienteEmail: customerEmail?.trim() || undefined,
    clienteDireccion: tipoPedido === 'A_DOMICILIO' ? deliveryAddress?.trim() : undefined,
    horaProgramada: tipoPedido === 'PARA_LLEVAR' ? scheduledTime?.trim() : undefined,
    items: items.map(mapCartItemToOrderPayload),
    couponCode: appliedCoupon?.code || undefined,
    notas: customerNotes?.trim() || undefined,
    metodoPago: paymentMethod || undefined,
  };
};

export const useCreateOrder = () => {
  const { loading, error, setError, execute } = useApiRequest();

  const createOrderFromCart = useCallback(async () => {
    const state = useOrderCartStore.getState();

    const validation = validateOrderFields(state);
    if (!validation.valid) {
      setError(validation.message);
      return { success: false, error: validation.message };
    }

    if (!resolveClienteNombre(state.customerName)) {
      const message = 'Ingresa el nombre de quien recibe el pedido.';
      setError(message);
      return { success: false, error: message };
    }

    const payload = buildOrderPayload();

    const stockResult = await execute(
      () => checkOrderStock(payload),
      'No hay stock suficiente para uno o más productos del carrito.',
    );
    if (!stockResult.success) return stockResult;

    const eventsResult = await execute(
      () => checkOrderEvents(payload),
      'No se pudo verificar promociones vigentes.',
    );
    if (!eventsResult.success) return eventsResult;

    const eventPreview = eventsResult.data?.data?.evento || null;
    if (eventPreview) {
      useOrderCartStore.getState().applyEvent(eventPreview);
    }

    const createResult = await execute(() => createOrder(payload), 'No se pudo crear el pedido.');

    if (createResult.success) {
      useOrderCartStore.getState().clearCart();
    }

    return createResult;
  }, [execute, setError]);

  return { loading, error, createOrderFromCart };
};
