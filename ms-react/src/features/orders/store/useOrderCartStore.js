import { create } from 'zustand';

export const useOrderCartStore = create((set, get) => ({
  // State
  currentStep: 1, // 1: Select mesa, 2: Add items (cart), 3: Confirm order
  selectedMesa: null,
  restaurantId: null,
  items: [], // { tipo: 'PLATO'|'MENU', id, cantidad, nombre, precio, precioUnitario }
  couponCode: '',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  clientAddress: '',
  clientScheduledTime: '',
  orderType: 'EN_MESA', // EN_MESA, A_DOMICILIO, PARA_LLEVAR
  discount: 0,
  discountType: '', // PERCENTAGE, FIXED_AMOUNT
  taxPercentage: 19, // Default 19% tax
  notes: '',
  
  // Methods
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setRestaurant: (restaurantId) => set({ restaurantId }),
  
  setSelectedMesa: (mesa) => set({ selectedMesa: mesa }),
  
  setOrderType: (type) => set({ orderType: type }),
  
  addItem: (item) => set((state) => {
    const existingItem = state.items.find(
      (i) => i.tipo === item.tipo && i.id === item.id
    );
    
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.id === item.id && i.tipo === item.tipo
            ? { ...i, cantidad: i.cantidad + item.cantidad }
            : i
        ),
      };
    }
    
    return {
      items: [...state.items, { ...item, cantidad: item.cantidad || 1 }],
    };
  }),
  
  removeItem: (tipo, id) => set((state) => ({
    items: state.items.filter((i) => !(i.tipo === tipo && i.id === id)),
  })),
  
  updateItemQuantity: (tipo, id, cantidad) => set((state) => {
    if (cantidad <= 0) {
      return { items: state.items.filter((i) => !(i.tipo === tipo && i.id === id)) };
    }
    
    return {
      items: state.items.map((i) =>
        i.id === id && i.tipo === tipo ? { ...i, cantidad } : i
      ),
    };
  }),
  
  setClientInfo: (name, phone, email = '') => set({
    clientName: name,
    clientPhone: phone,
    clientEmail: email,
  }),
  
  setClientAddress: (address) => set({ clientAddress: address }),
  
  setClientScheduledTime: (time) => set({ clientScheduledTime: time }),
  
  setCoupon: (code) => set({ couponCode: code }),
  
  setDiscount: (amount, type = 'FIXED_AMOUNT') => set({
    discount: amount,
    discountType: type,
  }),
  
  setNotes: (notes) => set({ notes }),
  
  // Calculate totals
  getSubtotal: () => {
    const state = get();
    return state.items.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);
  },
  
  getDiscount: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    
    if (state.discount === 0) return 0;
    
    if (state.discountType === 'PERCENTAGE') {
      return subtotal * (state.discount / 100);
    }
    
    return state.discount;
  },
  
  getTax: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    const discount = state.getDiscount();
    const taxableAmount = subtotal - discount;
    
    return taxableAmount * (state.taxPercentage / 100);
  },
  
  getTotal: () => {
    const state = get();
    return state.getSubtotal() - state.getDiscount() + state.getTax();
  },
  
  // Clear cart and reset
  resetCart: () => set({
    currentStep: 1,
    selectedMesa: null,
    restaurantId: null,
    items: [],
    couponCode: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    clientScheduledTime: '',
    orderType: 'EN_MESA',
    discount: 0,
    discountType: '',
    notes: '',
  }),
}));
