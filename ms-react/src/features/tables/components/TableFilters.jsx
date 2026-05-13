import { useEffect, useRef } from 'react';
import { Input, Typography } from '@material-tailwind/react';
import { useTableStore } from '../store/useTableStore.js';

export const TableFilters = ({ searchTerm, onSearchChange }) => {
  const componentMountedRef = useRef(false);
  const restaurantOptions = useTableStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useTableStore((state) => state.fetchRestaurantOptions);
  const restaurantOptionsLoading = useTableStore((state) => state.restaurantOptionsLoading);
  const selectedRestaurantId = useTableStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useTableStore((state) => state.setSelectedRestaurantId);

  // Refresca cada vez que el componente se monta
  useEffect(() => {
    console.log('🔄 [TABLE FILTERS] Componente montado, refrescando restaurantes...');
    fetchRestaurantOptions(true); // Force refresh
    componentMountedRef.current = true;
    
    return () => {
      console.log('👋 [TABLE FILTERS] Componente desmontado');
    };
  }, [fetchRestaurantOptions]);

  return (
    <div className="mb-6 rounded-xl border border-stone-200 bg-[#2C4035] p-5 shadow-lg">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
        <div>
          <Typography variant="small" className="mb-2 font-medium tracking-wide text-stone-300">
            Buscar por nombre o ubicación
          </Typography>
          <Input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            label="Buscar por nombre o ubicación"
            className="bg-white"
            labelProps={{ className: 'text-[#2C4035]' }}
            containerProps={{ className: 'min-w-full' }}
          />
        </div>

        <div>
          <Typography variant="small" className="mb-2 font-medium tracking-wide text-stone-300">
            Filtrar por restaurante
          </Typography>
          <select
            value={selectedRestaurantId}
            onChange={(event) => setSelectedRestaurantId(event.target.value || '')}
            disabled={restaurantOptionsLoading}
            className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-3 text-stone-900 shadow-sm outline-none transition focus:border-[#2C4035] focus:ring-2 focus:ring-[#2C4035]/20 disabled:cursor-not-allowed disabled:opacity-70"
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
