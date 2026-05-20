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
      <div className="min-h-screen bg-[#0b0a08] text-[#f5ede0]">
        <RestaurantNavbar />
        <NoRestaurantAssigned />
        <ProfileModal />
      </div>
    );
  }

  const showDashboardHome = location.pathname === '/restaurant-dashboard' || location.pathname === '/restaurant-dashboard/';
  const isMenusRoute = location.pathname.startsWith('/restaurant-dashboard/menus');
  const isReportsRoute = location.pathname.includes('/reportes') || location.pathname.includes('/reports');

  return (
    <div className="min-h-screen bg-[#0b0a08] flex flex-col text-[#f5ede0]">
      <RestaurantNavbar />
      <div className="flex flex-1 overflow-hidden">
        <RestaurantSidebar />

        <main className={`flex-1 overflow-y-auto ${(showDashboardHome || isMenusRoute || isReportsRoute) ? 'p-0 bg-[#0a0a08] text-[#f5ede0]' : 'p-6 bg-[#F8F5F0] text-[#1A1A1A]'}`}>
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
