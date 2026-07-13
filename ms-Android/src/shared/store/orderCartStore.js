import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getEntryDiscount = (subtotal, entry) => {
  if (!entry) return 0;
  if (entry.discountType === 'PERCENTAGE') return subtotal * (Number(entry.discountValue || 0) / 100);
  if (entry.discountType === 'FIXED_AMOUNT') return Number(entry.discountValue || 0);
  return 0;
};

export const calculateCartTotals = ({ items, appliedCoupon, appliedEvent, taxPercentage }) => {
  const subtotal = items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);
  const rawDiscount = getEntryDiscount(subtotal, appliedCoupon) + getEntryDiscount(subtotal, appliedEvent);
  const discount = Math.min(rawDiscount, subtotal);
  const tax = (subtotal - discount) * (Number(taxPercentage || 0) / 100);
  const total = subtotal - discount + tax;

  return { subtotal, discount, tax, total };
};

export const mapCartItemToOrderPayload = (item) => ({
  tipo: item.tipo,
  ...(item.tipo === 'PLATO' ? { plato: item.id } : { menu: item.id }),
  cantidad: item.cantidad,
});

const CHECKOUT_DEFAULTS = {
  tipoPedido: null,
  selectedTable: null,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  deliveryAddress: '',
  scheduledTime: '',
  customerNotes: '',
  paymentMethod: null,
};

export const validateOrderFields = ({
  restaurantId,
  items,
  tipoPedido,
  selectedTable,
  deliveryAddress,
  scheduledTime,
  customerPhone,
}) => {
  if (!restaurantId) return { valid: false, message: 'Selecciona un restaurante antes de continuar con el pedido.' };
  if (!items || items.length === 0) return { valid: false, message: 'Tu carrito está vacío.' };
  if (!tipoPedido) return { valid: false, message: 'Selecciona un tipo de pedido.' };

  if (tipoPedido === 'EN_MESA' && !selectedTable?._id) {
    return { valid: false, message: 'Selecciona una mesa antes de continuar con el pedido.' };
  }

  if (tipoPedido === 'A_DOMICILIO' && !deliveryAddress?.trim()) {
    return { valid: false, message: 'Ingresa la dirección de entrega.' };
  }

  if (tipoPedido === 'PARA_LLEVAR' && !scheduledTime?.trim()) {
    return { valid: false, message: 'Ingresa la hora de recogida.' };
  }

  if ((tipoPedido === 'A_DOMICILIO' || tipoPedido === 'PARA_LLEVAR') && !customerPhone?.trim()) {
    return { valid: false, message: 'Ingresa un teléfono de contacto.' };
  }

  return { valid: true };
};

export const useOrderCartStore = create(
  persist(
    (set, get) => ({
      restaurantId: null,
      items: [],
      appliedCoupon: null,
      appliedEvent: null,
      taxPercentage: 19,
      ...CHECKOUT_DEFAULTS,

      setRestaurantId: (restaurantId) => {
        if (restaurantId !== get().restaurantId) {
          set({ restaurantId, items: [], appliedCoupon: null, appliedEvent: null, selectedTable: null });
        }
      },

      setTipoPedido: (tipoPedido) =>
        set((state) => ({
          tipoPedido,
          selectedTable: tipoPedido === 'EN_MESA' ? state.selectedTable : null,
        })),

      setSelectedTable: (table) => set({ selectedTable: table }),

      setCustomerName: (customerName) => set({ customerName }),
      setCustomerPhone: (customerPhone) => set({ customerPhone }),
      setCustomerEmail: (customerEmail) => set({ customerEmail }),
      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
      setScheduledTime: (scheduledTime) => set({ scheduledTime }),
      setCustomerNotes: (customerNotes) => set({ customerNotes }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      resetForNewOrder: () =>
        set({ items: [], restaurantId: null, appliedCoupon: null, appliedEvent: null, ...CHECKOUT_DEFAULTS }),

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.tipo === item.tipo && i.id === item.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.tipo === item.tipo && i.id === item.id
                  ? { ...i, cantidad: i.cantidad + quantity }
                  : i,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                tipo: item.tipo,
                id: item.id,
                nombre: item.nombre,
                precioUnitario: item.precioUnitario,
                cantidad: quantity,
              },
            ],
          };
        });
      },

      removeItem: (tipo, id) => {
        set((state) => ({
          items: state.items
            .map((i) => (i.tipo === tipo && i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
            .filter((i) => i.cantidad > 0),
        }));
      },

      setItemQuantity: (tipo, id, quantity) => {
        set((state) => ({
          items:
            quantity > 0
              ? state.items.map((i) => (i.tipo === tipo && i.id === id ? { ...i, cantidad: quantity } : i))
              : state.items.filter((i) => !(i.tipo === tipo && i.id === id)),
        }));
      },

      clearCart: () => set({ items: [], appliedCoupon: null, appliedEvent: null, ...CHECKOUT_DEFAULTS }),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      applyEvent: (event) => set({ appliedEvent: event }),

      removeEvent: () => set({ appliedEvent: null }),
    }),
    {
      name: 'order-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
