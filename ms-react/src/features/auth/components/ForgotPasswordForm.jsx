import { useForm } from 'react-hook-form';
import { AuthInput, AuthPrimaryButton, AuthSwitchLink } from '../../../shared/components/auth/index.js';

export const ForgotPasswordForm = ({ onSwitch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    // Mandar información al backend para restablecer contraseña
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        id="email"
        label="Email"
        type="email"
        placeholder="correo@ejemplo.com"
        register={register}
        rules={{
          required: 'El email es obligatorio',
        }}
        error={errors.email}
        autoComplete="email"
      />

      <AuthPrimaryButton type="submit">Enviar Correo</AuthPrimaryButton>

      <AuthSwitchLink
        prefixText="¿Recordaste tu contraseña?"
        actionText="Iniciar Sesión"
        onClick={onSwitch}
      />
    </form>
  );
};