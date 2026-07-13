import { useCallback, useState } from 'react';
import { useApiRequest } from '../../../shared/hooks/useApiRequest';
import { getMesas } from '../../../shared/api/mesaApi';

const resolveIsOccupied = (mesa) => {
  if (typeof mesa.isOccupied === 'boolean') return mesa.isOccupied;
  if (typeof mesa.disponible === 'boolean') return !mesa.disponible;
  if (typeof mesa.ocupada === 'boolean') return Boolean(mesa.ocupada);
  if (typeof mesa.estado === 'string') {
    return !['LIBRE', 'DISPONIBLE'].includes(mesa.estado.toUpperCase());
  }
  return false;
};

export const useAvailableTables = () => {
  const { loading, error, execute } = useApiRequest();
  const [tables, setTables] = useState([]);

  const fetchTables = useCallback(
    async (restaurantId) => {
      const result = await execute(
        () => getMesas(restaurantId).then((res) => res.data),
        'No se pudieron cargar las mesas del restaurante.',
      );

      if (result.success) {
        const rawTables = result.data?.data || [];
        setTables(rawTables.map((mesa) => ({ ...mesa, isOccupied: resolveIsOccupied(mesa) })));
      }

      return result;
    },
    [execute],
  );

  return { tables, loading, error, fetchTables };
};
