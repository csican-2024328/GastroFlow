import { useState, useCallback } from 'react';
import { getAvailableTables } from '../../../shared/api/reservationApi';

export const useAvailableTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailableTables = useCallback(async (restaurantId, date, timeStart, timeEnd) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getAvailableTables(restaurantId, date, timeStart, timeEnd);
      // Format: could be { data: [...] } or just [...]
      const tablesList = data.data || data.availableTables || (Array.isArray(data) ? data : []);
      setTables(tablesList);
      return tablesList;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al obtener mesas disponibles';
      setError(errMsg);
      setTables([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tables,
    loading,
    error,
    fetchAvailableTables,
  };
};
