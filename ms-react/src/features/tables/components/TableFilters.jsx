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
    <div className="bg-[#0F452A] border border-[#113a26] rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <p className="text-sm text-[#C4A882] mb-2">Filtrar por restaurante</p>
          <Select
            label="Selecciona un restaurante"
            value={selectedRestaurantId}
            onChange={handleChange}
            disabled={restaurantOptionsLoading}
            className="text-[#F0EDE8]"
            containerProps={{ className: 'min-w-full' }}
          >
            <Option value="">Todos los restaurantes</Option>
            {restaurantOptions.map((restaurant) => (
              <Option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};
