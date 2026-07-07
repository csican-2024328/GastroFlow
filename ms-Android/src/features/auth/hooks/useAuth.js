import { useState } from 'react';
import { login as loginRequest, register as registerRequest } from '../../../shared/api/authClient';
import { useAuthStore } from '../../../shared/store/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const handleLogin = async ({ emailOrUsername, password }) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await loginRequest({ emailOrUsername, password });
      login(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const payload = { ...data, email: data.email.trim().toLowerCase() };
      const response = await registerRequest(payload);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible crear la cuenta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleRegister, loading, error, logout };
};
