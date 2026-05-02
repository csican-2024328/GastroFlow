import { Input } from '@material-tailwind/react';
import { Typography } from '@material-tailwind/react';
import { useDishStore } from '../store/useDishStore.js';

export const DishFilters = ({ searchTerm, onSearchChange }) => {
  const restaurantOptions = useDishStore((state) => state.restaurantOptions);
  const selectedRestaurantId = useDishStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useDishStore((state) => state.setSelectedRestaurantId);

  return (
    <div className="mb-6 rounded-lg border border-stone-200 bg-[#2C4035] p-4 shadow-md">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
        <div>
          <Typography variant="small" className="mb-2 font-semibold text-stone-50">
            Buscar por nombre
          </Typography>
          <Input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            label="Buscar por nombre"
            className="bg-white"
            labelProps={{ className: 'text-[#2C4035]' }}
            containerProps={{ className: 'min-w-full' }}
          />
        </div>

        <div>
          <Typography variant="small" className="mb-2 font-semibold text-stone-50">
            Filtrar por:
          </Typography>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-stone-900 outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2C4035]/20 disabled:cursor-not-allowed disabled:opacity-70"
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
