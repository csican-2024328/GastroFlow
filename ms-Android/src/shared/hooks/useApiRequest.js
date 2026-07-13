import { useCallback, useState } from 'react';
import { getErrorMessage } from '../utils/getErrorMessage';

export const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (requestFn, fallbackMessage = 'Ocurrió un error inesperado.') => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestFn();
      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(err, fallbackMessage);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, execute };
};
