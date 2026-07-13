import { useMemo } from 'react';
import { useOrderCartStore, calculateCartTotals } from '../../../shared/store/orderCartStore';

export const useOrderCart = () => {
  const items = useOrderCartStore((state) => state.items);
  const restaurantId = useOrderCartStore((state) => state.restaurantId);
  const tipoPedido = useOrderCartStore((state) => state.tipoPedido);
  const selectedTable = useOrderCartStore((state) => state.selectedTable);
  const customerName = useOrderCartStore((state) => state.customerName);
  const customerPhone = useOrderCartStore((state) => state.customerPhone);
  const customerEmail = useOrderCartStore((state) => state.customerEmail);
  const deliveryAddress = useOrderCartStore((state) => state.deliveryAddress);
  const scheduledTime = useOrderCartStore((state) => state.scheduledTime);
  const customerNotes = useOrderCartStore((state) => state.customerNotes);
  const paymentMethod = useOrderCartStore((state) => state.paymentMethod);
  const appliedCoupon = useOrderCartStore((state) => state.appliedCoupon);
  const appliedEvent = useOrderCartStore((state) => state.appliedEvent);
  const taxPercentage = useOrderCartStore((state) => state.taxPercentage);

  const setRestaurantId = useOrderCartStore((state) => state.setRestaurantId);
  const setTipoPedido = useOrderCartStore((state) => state.setTipoPedido);
  const setSelectedTable = useOrderCartStore((state) => state.setSelectedTable);
  const setCustomerName = useOrderCartStore((state) => state.setCustomerName);
  const setCustomerPhone = useOrderCartStore((state) => state.setCustomerPhone);
  const setCustomerEmail = useOrderCartStore((state) => state.setCustomerEmail);
  const setDeliveryAddress = useOrderCartStore((state) => state.setDeliveryAddress);
  const setScheduledTime = useOrderCartStore((state) => state.setScheduledTime);
  const setCustomerNotes = useOrderCartStore((state) => state.setCustomerNotes);
  const setPaymentMethod = useOrderCartStore((state) => state.setPaymentMethod);
  const addItem = useOrderCartStore((state) => state.addItem);
  const removeItem = useOrderCartStore((state) => state.removeItem);
  const clearCart = useOrderCartStore((state) => state.clearCart);
  const resetForNewOrder = useOrderCartStore((state) => state.resetForNewOrder);
  const applyCoupon = useOrderCartStore((state) => state.applyCoupon);
  const removeCoupon = useOrderCartStore((state) => state.removeCoupon);
  const applyEvent = useOrderCartStore((state) => state.applyEvent);
  const removeEvent = useOrderCartStore((state) => state.removeEvent);

  const totals = useMemo(
    () => calculateCartTotals({ items, appliedCoupon, appliedEvent, taxPercentage }),
    [items, appliedCoupon, appliedEvent, taxPercentage],
  );

  return {
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
    paymentMethod,
    appliedCoupon,
    appliedEvent,
    ...totals,
    setRestaurantId,
    setTipoPedido,
    setSelectedTable,
    setCustomerName,
    setCustomerPhone,
    setCustomerEmail,
    setDeliveryAddress,
    setScheduledTime,
    setCustomerNotes,
    setPaymentMethod,
    addItem,
    removeItem,
    clearCart,
    resetForNewOrder,
    applyCoupon,
    removeCoupon,
    applyEvent,
    removeEvent,
  };
};
