import { useCallback, useEffect, useRef, useState } from 'react';
import { useOrderCartStore, mapCartItemToOrderPayload } from '../../../shared/store/orderCartStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { checkOrderStock } from '../../../shared/api/orderApi';

const DEBOUNCE_MS = 500;

const buildStockCheckPayload = (items, restaurantId) => ({
  tipoPedido: 'PARA_LLEVAR',
  horaProgramada: '23:59',
  restaurantID: restaurantId,
  clienteNombre: useAuthStore.getState().user?.name || 'Cliente',
  items: items.map(mapCartItemToOrderPayload),
});

const keyFor = (item) => `${item.tipo}-${item.id}`;

export const useStockGuard = () => {
  const [blockedKeys, setBlockedKeys] = useState({});
  const [checkingKeys, setCheckingKeys] = useState({});
  const timers = useRef({});

  const baselineQuantities = useRef({});

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      Object.values(activeTimers).forEach(clearTimeout);
    };
  }, []);

  const isBlocked = useCallback((item) => Boolean(blockedKeys[keyFor(item)]), [blockedKeys]);
  const isChecking = useCallback((item) => Boolean(checkingKeys[keyFor(item)]), [checkingKeys]);

  const requestIncrement = useCallback((item, { onRejected } = {}) => {
    const key = keyFor(item);

    if (!(key in baselineQuantities.current)) {
      const current = useOrderCartStore
        .getState()
        .items.find((i) => i.tipo === item.tipo && i.id === item.id);
      baselineQuantities.current[key] = current?.cantidad || 0;
    }

    useOrderCartStore.getState().addItem(item, 1);

    if (timers.current[key]) clearTimeout(timers.current[key]);
    setCheckingKeys((prev) => ({ ...prev, [key]: true }));

    timers.current[key] = setTimeout(async () => {
      const { items, restaurantId } = useOrderCartStore.getState();
      const payload = buildStockCheckPayload(items, restaurantId);

      try {
        await checkOrderStock(payload);
        setBlockedKeys((prev) => ({ ...prev, [key]: false }));
      } catch {
        const baseline = baselineQuantities.current[key] ?? 0;
        useOrderCartStore.getState().setItemQuantity(item.tipo, item.id, baseline);
        setBlockedKeys((prev) => ({ ...prev, [key]: true }));
        onRejected?.();
      } finally {
        setCheckingKeys((prev) => ({ ...prev, [key]: false }));
        delete baselineQuantities.current[key];
      }
    }, DEBOUNCE_MS);
  }, []);

  return {
    isBlocked,
    isChecking,
    requestIncrement,
    stockGuardState: { blockedKeys, checkingKeys },
  };
};
