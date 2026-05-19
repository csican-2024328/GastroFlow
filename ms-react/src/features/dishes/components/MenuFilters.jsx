import { useEffect } from 'react';
import { Input, Typography } from '@material-tailwind/react';
import { useMenuStore } from '../store/useMenuStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';

export const MenuFilters = ({ searchTerm, onSearchChange }) => {
  const restaurantOptions = useMenuStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useMenuStore((state) => state.fetchRestaurantOptions);
  const selectedRestaurantId = useMenuStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useMenuStore((state) => state.setSelectedRestaurantId);
  const { isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();

  useEffect(() => {
    fetchRestaurantOptions();
  }, [fetchRestaurantOptions]);

  return (
    <div className="mb-6 rounded-lg border border-stone-200 bg-[#2D4F4F] p-4 shadow-md">
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
            labelProps={{ className: 'text-[#2D4F4F]' }}
            containerProps={{ className: 'min-w-full' }}
          />
        </div>

        {!(isRestaurantAdmin && hasRestaurantAssigned) ? (
          <div>
            <Typography variant="small" className="mb-2 font-semibold text-stone-50">
              Filtrar por restaurante
            </Typography>
            <select
              value={selectedRestaurantId}
              onChange={(event) => setSelectedRestaurantId(event.target.value)}
              className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-stone-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20"
            >
              <option value="">Todos los restaurantes</option>
              {restaurantOptions.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <p className="text-sm text-stone-200">Mostrando datos del restaurante asignado</p>
          </div>
        )}
      </div>
    </div>
  );
};