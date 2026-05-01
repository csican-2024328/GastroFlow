import { Typography } from '@material-tailwind/react';
import { useDishStore } from '../store/useDishStore.js';

export const DishFilters = () => {
  const restaurantOptions = useDishStore((state) => state.restaurantOptions);
  const selectedRestaurantId = useDishStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useDishStore((state) => state.setSelectedRestaurantId);

  return (
    <div className="mb-6 flex items-center gap-4 rounded-lg border border-stone-200 bg-gradient-to-r bg-emerald-900 p-4 shadow-md">
      <Typography variant="small" className="font-semibold text-stone-50">
        Filtrar por:
      </Typography>
      <select
        value={selectedRestaurantId}
        onChange={(e) => setSelectedRestaurantId(e.target.value)}
        className="border-stone-300 bg-white px-3 py-3 text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20 rounded-md border"
      >
        <option value="">Todos los restaurantes</option>
        {restaurantOptions.map((restaurant) => (
          <option key={restaurant._id} value={restaurant._id}>
            {restaurant.name}
          </option>
        ))}
      </select>
    </div>
  );
};
