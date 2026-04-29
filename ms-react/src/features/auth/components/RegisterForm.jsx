import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerRequest } from '../../../shared/api/auth.js';
import { AuthInput, AuthPrimaryButton, AuthSwitchLink } from '../../../shared/components/auth/index.js';

const getRegisterErrorMessage = (error) => {
  const backendErrors = error.response?.data?.errors;

  if (Array.isArray(backendErrors) && backendErrors.length > 0) {
    return backendErrors.map((item) => item.message).join(' · ');
  }

  return error.response?.data?.message || 'No fue posible crear la cuenta';
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,255}$/;
const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const usernamePattern = /^[a-zA-Z0-9_-]+$/;
const phonePattern = /^[2-9]\d{7}$/;

export const RegisterForm = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({ mode: 'onTouched' });

  const password = useWatch({ control, name: 'password' });

  const onSubmit = async (formData) => {
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      };

      const { data } = await registerRequest(payload);

      toast.success(data?.message || 'Cuenta creada correctamente');
      navigate('/');
    } catch (error) {
      toast.error(getRegisterErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        id="name"
        label="Nombre"
        type="text"
        placeholder="Tu nombre"
        register={register}
        rules={{
          required: 'El nombre es obligatorio',
          minLength: {
            value: 2,
            message: 'El nombre debe tener al menos 2 caracteres',
          },
          maxLength: {
            value: 25,
            message: 'El nombre no puede tener más de 25 caracteres',
          },
          pattern: {
            value: namePattern,
            message: 'El nombre solo puede contener letras y espacios',
          },
        }}
        error={errors.name}
        autoComplete="given-name"
      />

      <AuthInput
        id="surname"
        label="Apellido"
        type="text"
        placeholder="Tu apellido"
        register={register}
        rules={{
          required: 'El apellido es obligatorio',
          minLength: {
            value: 2,
            message: 'El apellido debe tener al menos 2 caracteres',
          },
          maxLength: {
            value: 25,
            message: 'El apellido no puede tener más de 25 caracteres',
          },
          pattern: {
            value: namePattern,
            message: 'El apellido solo puede contener letras y espacios',
          },
        }}
        error={errors.surname}
        autoComplete="family-name"
      />

      <AuthInput
        id="username"
        label="Usuario"
        type="text"
        placeholder="usuario123"
        register={register}
        rules={{
          required: 'El usuario es obligatorio',
          minLength: {
            value: 3,
            message: 'El usuario debe tener al menos 3 caracteres',
          },
          maxLength: {
            value: 50,
            message: 'El usuario no puede tener más de 50 caracteres',
          },
          pattern: {
            value: usernamePattern,
            message: 'El usuario solo puede contener letras, números, guiones y guiones bajos',
          },
        }}
        error={errors.username}
        autoComplete="username"
      />

      <AuthInput
        id="email"
        label="Email"
        type="email"
        placeholder="correo@ejemplo.com"
        register={register}
        rules={{
          required: 'El email es obligatorio',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'Ingresa un email válido',
          },
        }}
        error={errors.email}
        autoComplete="email"
      />

      <AuthInput
        id="phone"
        label="Teléfono"
        type="text"
        placeholder="22345678"
        register={register}
        rules={{
          required: 'El teléfono es obligatorio',
          pattern: {
            value: phonePattern,
            message: 'El teléfono debe tener 8 dígitos y comenzar entre 2 y 9',
          },
        }}
        error={errors.phone}
        autoComplete="tel"
      />

      <AuthInput
        id="password"
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        register={register}
        rules={{
          required: 'La contraseña es obligatoria',
          minLength: {
            value: 8,
            message: 'La contraseña debe tener al menos 8 caracteres',
          },
          maxLength: {
            value: 255,
            message: 'La contraseña no puede superar 255 caracteres',
          },
          pattern: {
            value: passwordPattern,
            message: 'La contraseña debe incluir mayúscula, minúscula, número y un carácter especial',
          },
        }}
        error={errors.password}
        autoComplete="new-password"
      />

      <AuthInput
        id="passwordConfirm"
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        register={register}
        rules={{
          required: 'Debes confirmar la contraseña',
          validate: (value) => value === password || 'Las contraseñas no coinciden',
        }}
        error={errors.passwordConfirm}
        autoComplete="new-password"
      />

      <AuthPrimaryButton type="submit" loading={loading} loadingText="Registrando...">
        Crear Cuenta
      </AuthPrimaryButton>

      <AuthSwitchLink prefixText="¿Ya tienes cuenta?" actionText="Iniciar Sesión" onClick={onSwitch} />
    </form>
  );
};