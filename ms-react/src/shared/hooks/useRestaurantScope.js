import { useAuthStore } from '../../features/auth/store/authStore.js';

const normalizeRole = (role) => (role || '').toString().trim().toUpperCase();

const resolveRestaurantId = (user) => {
  const restaurant = user?.restaurantId ?? user?.RestaurantId ?? null;

  if (!restaurant) return '';
  if (typeof restaurant === 'string') return restaurant;

  return restaurant?._id || restaurant?.id || '';
};

export const useRestaurantScope = () => {
  const user = useAuthStore((state) => state.user);

  const role = normalizeRole(user?.role);
  const restaurantId = role === 'RESTAURANT_ADMIN' ? resolveRestaurantId(user) : '';

  return {
    user,
    role,
    restaurantId,
    hasRestaurantAssigned: Boolean(restaurantId),
    isRestaurantAdmin: role === 'RESTAURANT_ADMIN',
  };
};
