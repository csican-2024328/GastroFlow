import { useForm } from 'react-hook-form';

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
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1.5">
          Email
        </label>

        <input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          {...register('email', {
            required: 'El email es obligatorio',
          })}
        />

        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:opacity-90"
      >
        Enviar Correo
      </button>

      <p className="text-center text-sm text-gray-600">
        ¿Recordaste tu contraseña?{' '}
        <button type="button" className="text-blue-600 font-medium hover:opacity-80" onClick={onSwitch}>
          Iniciar Sesión
        </button>
      </p>
    </form>
  );
};