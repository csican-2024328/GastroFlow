import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

export const LoginForm = ({ onForgot }) => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);

    if (result.success) {
      navigate('/dashboard');
      showSuccess('¡Bienvenido de nuevo!');
      return;
    }

    showError(result.error || 'No fue posible iniciar sesión');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-800 mb-1.5">
          Email o Usuario
        </label>

        <input
          id="emailOrUsername"
          type="text"
          placeholder="correo@ejemplo.com o usuario"
          className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          {...register('emailOrUsername', {
            required: 'Este campo es obligatorio',
          })}
        />

        {errors.emailOrUsername && <p className="text-red-600 text-xs mt-1">{errors.emailOrUsername.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1.5">
          Contraseña
        </label>

        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          {...register('password', {
            required: 'La contraseña es obligatoria',
          })}
        />

        {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>

      <p className="text-center text-sm">
        <button type="button" onClick={onForgot} className="text-blue-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </button>
      </p>
    </form>
  );
};