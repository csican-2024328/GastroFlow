import { useEffect } from 'react';
import { Select, Option } from '@material-tailwind/react';
import { useTableStore } from '../store/useTableStore.js';

export const TableFilters = () => {
  const restaurantOptions = useTableStore((state) => state.restaurantOptions);
  const fetchRestaurantOptions = useTableStore((state) => state.fetchRestaurantOptions);
  const restaurantOptionsLoading = useTableStore((state) => state.restaurantOptionsLoading);
  const selectedRestaurantId = useTableStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useTableStore((state) => state.setSelectedRestaurantId);

  const handleChange = (value) => {
    setSelectedRestaurantId(value || '');
  };

  useEffect(() => {
    if (restaurantOptions.length === 0) {
      fetchRestaurantOptions();
    }
  }, [fetchRestaurantOptions, restaurantOptions.length]);

  return (
    <div className="bg-gradient-to-r from-[var(--gf-green)] to-[var(--gf-green)]/95 border border-[var(--gf-beige)]/35 rounded-xl p-5 mb-6 shadow-[0_12px_28px_rgba(26,26,26,0.16)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <p className="text-sm font-medium tracking-wide text-[var(--gf-beige)] mb-2">Filtrar por restaurante</p>
          <Select
            label="Selecciona un restaurante"
            value={selectedRestaurantId}
            onChange={handleChange}
            disabled={restaurantOptionsLoading}
            className="text-[var(--gf-cream)] !border-[var(--gf-beige)]/45 rounded-md"
            containerProps={{ className: 'min-w-full' }}
            menuProps={{
              className:
                'bg-[var(--gf-cream)] border border-[var(--gf-beige)] text-[var(--gf-graphite)]',
            }}
          >
            <Option
              value=""
              className="!text-[var(--gf-graphite)] hover:!bg-[var(--gf-beige)]/40 focus:!bg-[var(--gf-beige)]/40"
            >
              Todos los restaurantes
            </Option>
            {restaurantOptions.map((restaurant) => (
              <Option
                key={restaurant._id}
                value={restaurant._id}
                className="!text-[var(--gf-graphite)] hover:!bg-[var(--gf-beige)]/40 focus:!bg-[var(--gf-beige)]/40"
              >
                {restaurant.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};
