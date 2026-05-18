import { useEffect, useRef } from 'react';
import { Input } from '@material-tailwind/react';
import { Typography } from '@material-tailwind/react';
import { useDishStore } from '../store/useDishStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';

export const DishFilters = ({ searchTerm, onSearchChange }) => {
  const componentMountedRef = useRef(false);
  const restaurantOptions = useDishStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useDishStore((state) => state.fetchRestaurantOptions);
  const selectedRestaurantId = useDishStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useDishStore((state) => state.setSelectedRestaurantId);
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();

  // Refresca cada vez que el componente se monta
  useEffect(() => {
    console.log('🔄 [DISH FILTERS] Componente montado, refrescando restaurantes...');
    fetchRestaurantOptions(true); // Force refresh
    componentMountedRef.current = true;
    
    return () => {
      console.log('👋 [DISH FILTERS] Componente desmontado');
    };
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
              Filtrar por:
            </Typography>
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-3 text-stone-900 outline-none transition focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20 disabled:cursor-not-allowed disabled:opacity-70"
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
