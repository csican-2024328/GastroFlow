import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { AuthInput, AuthPrimaryButton, AuthSwitchLink } from '../../../shared/components/auth/index.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';


export const LoginForm = ({ onForgot, onRegister }) => {
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
      notyfSuccess('¡Bienvenido de nuevo!', { duration: 2000 });
      const role = result.data?.userDetails?.role || 'CLIENT';
      navigate(role === 'CLIENT' ? '/cliente' : '/dashboard');
      return;
    }

    notyfError(result.error || 'No fue posible iniciar sesión', { duration: 2000 });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        id="emailOrUsername"
        label="Email o Usuario"
        type="text"
        placeholder="correo@ejemplo.com o usuario"
        register={register}
        rules={{
          required: 'Este campo es obligatorio',
        }}
        error={errors.emailOrUsername}
        autoComplete="username"
      />

      <AuthInput
        id="password"
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        register={register}
        rules={{
          required: 'La contraseña es obligatoria',
        }}
        error={errors.password}
        autoComplete="current-password"
      />

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

      <AuthPrimaryButton type="submit" loading={loading} loadingText="Iniciando...">
        Iniciar Sesión
      </AuthPrimaryButton>

      <AuthSwitchLink
        prefixText="¿No tienes cuenta?"
        actionText="Registrarme"
        onClick={onRegister}
      />

      <AuthSwitchLink
        actionText="¿Olvidaste tu contraseña?"
        onClick={onForgot}
      />
    </form>
  );
};