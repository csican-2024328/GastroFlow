import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ProfileModal } from '../../../features/auth/components/ProfileModal.jsx';
import { useRestaurantScope } from '../../hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from './NoRestaurantAssigned.jsx';
import { RestaurantNavbar } from './RestaurantNavbar.jsx';
import { RestaurantSidebar } from './RestaurantSidebar.jsx';
import { RestaurantDashboardOverview } from './RestaurantDashboardOverview.jsx';
import { useTableStore } from '../../../features/tables/store/useTableStore.js';
import { useIngredientStore } from '../../../features/ingredients/store/useIngredientStore.js';
import { useDishStore } from '../../../features/dishes/store/useDishStore.js';

export const RestaurantDashboardContainer = () => {
  const location = useLocation();
  const { restaurantId, hasRestaurantAssigned, isRestaurantAdmin } = useRestaurantScope();

  const setTableRestaurantId = useTableStore((state) => state.setSelectedRestaurantId);
  const setIngredientRestaurantId = useIngredientStore((state) => state.setSelectedRestaurantId);
  const setDishRestaurantId = useDishStore((state) => state.setSelectedRestaurantId);

  useEffect(() => {
    if (restaurantId) {
      setTableRestaurantId(restaurantId);
      setIngredientRestaurantId(restaurantId);
      setDishRestaurantId(restaurantId);
    } else {
      setTableRestaurantId('');
      setIngredientRestaurantId('');
      setDishRestaurantId('');
    }

    return () => {
      setTableRestaurantId('');
      setIngredientRestaurantId('');
      setDishRestaurantId('');
    };
  }, [restaurantId, setDishRestaurantId, setIngredientRestaurantId, setTableRestaurantId]);

  if (isRestaurantAdmin && !hasRestaurantAssigned) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A]">
        <RestaurantNavbar />
        <NoRestaurantAssigned />
        <ProfileModal />
      </div>
    );
  }

  const showDashboardHome = location.pathname === '/restaurant-dashboard' || location.pathname === '/restaurant-dashboard/';

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A]">
      <RestaurantNavbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <RestaurantSidebar />

        <main className="flex-1 bg-[#F8F5F0] p-6">
          {showDashboardHome ? (
            <RestaurantDashboardOverview />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <ProfileModal />
    </div>
  );
};
