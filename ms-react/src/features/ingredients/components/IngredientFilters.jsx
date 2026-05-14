import { useEffect, useRef } from 'react';
import { Input, Typography } from '@material-tailwind/react';
import { useIngredientStore } from '../store/useIngredientStore.js';

export const IngredientFilters = ({ searchTerm, onSearchChange }) => {
  const componentMountedRef = useRef(false);
  const restaurantOptions = useIngredientStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useIngredientStore((state) => state.fetchRestaurantOptions);
  const restaurantOptionsLoading = useIngredientStore((state) => state.restaurantOptionsLoading);
  const selectedRestaurantId = useIngredientStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useIngredientStore((state) => state.setSelectedRestaurantId);

  useEffect(() => {
    fetchRestaurantOptions(true);
    componentMountedRef.current = true;
    return () => {};
  }, [fetchRestaurantOptions]);

  return (
    <div className="mb-6 rounded-xl border border-[#E8D4B8] bg-[#F5EFEA] p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
        <div>
          <Typography
            variant="small"
            className="mb-2 font-medium tracking-wide text-[#2D4F4F]"
          >
            Buscar por nombre
          </Typography>
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            label="Buscar por nombre"
            className="bg-white"
            labelProps={{ className: 'text-[#2D4F4F]' }}
            containerProps={{ className: 'min-w-full' }}
          />
        </div>

        <div>
          <Typography
            variant="small"
            className="mb-2 font-medium tracking-wide text-[#2D4F4F]"
          >
            Filtrar por restaurante
          </Typography>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value || '')}
            disabled={restaurantOptionsLoading}
            className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-gray-900 shadow-sm outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <option value="">Todos los restaurantes</option>
            {restaurantOptions.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};