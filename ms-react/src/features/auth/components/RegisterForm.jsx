import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerRequest } from '../../../shared/api/auth.js';
 
/* ─────────────────────────────────────────
   Helpers de error — INTACTOS
───────────────────────────────────────── */
const getRegisterErrorMessage = (error) => {
  const backendErrors = error.response?.data?.errors;
  if (Array.isArray(backendErrors) && backendErrors.length > 0) {
    return backendErrors.map((item) => item.message).join(' · ');
  }
  return error.response?.data?.message || 'No fue posible crear la cuenta';
};
 
/* ─────────────────────────────────────────
   Patrones de validación — INTACTOS
───────────────────────────────────────── */
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,255}$/;
const namePattern     = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const usernamePattern = /^[a-zA-Z0-9_-]+$/;
const phonePattern    = /^[2-9]\d{7}$/;
 
/* ─────────────────────────────────────────
   Sub-componentes UI GastroFlow
───────────────────────────────────────── */
const ICON_MAP = {
  text:     'ti-user',
  email:    'ti-mail',
  password: 'ti-lock',
  tel:      'ti-phone',
};
 
const GrInput = ({ id, label, type = 'text', placeholder, register, rules, error, autoComplete }) => (
  <div className="gr-field">
    {label && <label htmlFor={id} className="gr-label">{label}</label>}
    <div className="gr-input-wrap">
      <i className={`ti ${ICON_MAP[type] ?? 'ti-user'} gr-input-icon`} aria-hidden="true" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`gr-input${error ? ' gr-input--error' : ''}`}
        {...register(id, rules)}
      />
    </div>
    {error && <span className="gr-error-msg">{error.message}</span>}
  </div>
);
 
const GrButton = ({ type = 'button', loading, loadingText, children }) => (
  <button type={type} disabled={loading} className="gr-btn-primary">
    <span className="gr-btn-shimmer" />
    {loading
      ? <><span className="gr-spinner" />{loadingText ?? 'Cargando...'}</>
      : children}
  </button>
);
 
const GrSwitchLink = ({ prefixText, actionText, onClick }) => (
  <p className="gr-switch-link">
    {prefixText && <span>{prefixText} </span>}
    <button type="button" onClick={onClick} className="gr-switch-link__action">
      {actionText}
    </button>
  </p>
);
 
/* ─────────────────────────────────────────
   RegisterForm — lógica 100 % intacta
───────────────────────────────────────── */
export const RegisterForm = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
 
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
      const payload = { ...formData, email: formData.email.trim().toLowerCase() };
      const { data } = await registerRequest(payload);
      const msg = '¡Registrado exitosamente! Se le ha enviado un correo para que se verifique';
      setSuccessMessage(msg);
      toast.success(msg);
      setTimeout(() => navigate('/login'), 900);
    } catch (error) {
      toast.error(getRegisterErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
 
      {/* Banner éxito */}
      {successMessage && (
        <div className="gr-success-banner fade-in">
          <i className="ti ti-circle-check" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}
 
      {/* Nombre + Apellido */}
      <div className="gr-row-2">
        <GrInput
          id="name" label="Nombre" type="text" placeholder="Tu nombre"
          register={register}
          rules={{
            required: 'El nombre es obligatorio',
            minLength: { value: 2,  message: 'El nombre debe tener al menos 2 caracteres' },
            maxLength: { value: 25, message: 'El nombre no puede tener más de 25 caracteres' },
            pattern:   { value: namePattern, message: 'El nombre solo puede contener letras y espacios' },
          }}
          error={errors.name} autoComplete="given-name"
        />
        <GrInput
          id="surname" label="Apellido" type="text" placeholder="Tu apellido"
          register={register}
          rules={{
            required: 'El apellido es obligatorio',
            minLength: { value: 2,  message: 'El apellido debe tener al menos 2 caracteres' },
            maxLength: { value: 25, message: 'El apellido no puede tener más de 25 caracteres' },
            pattern:   { value: namePattern, message: 'El apellido solo puede contener letras y espacios' },
          }}
          error={errors.surname} autoComplete="family-name"
        />
      </div>
 
      {/* Usuario */}
      <GrInput
        id="username" label="Usuario" type="text" placeholder="usuario123"
        register={register}
        rules={{
          required: 'El usuario es obligatorio',
          minLength: { value: 3,  message: 'El usuario debe tener al menos 3 caracteres' },
          maxLength: { value: 50, message: 'El usuario no puede tener más de 50 caracteres' },
          pattern:   { value: usernamePattern, message: 'El usuario solo puede contener letras, números, guiones y guiones bajos' },
        }}
        error={errors.username} autoComplete="username"
      />
 
      {/* Email */}
      <GrInput
        id="email" label="Email" type="email" placeholder="correo@ejemplo.com"
        register={register}
        rules={{
          required: 'El email es obligatorio',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Ingresa un email válido' },
        }}
        error={errors.email} autoComplete="email"
      />
 
      {/* Teléfono */}
      <GrInput
        id="phone" label="Teléfono" type="tel" placeholder="22345678"
        register={register}
        rules={{
          required: 'El teléfono es obligatorio',
          pattern: { value: phonePattern, message: 'El teléfono debe tener 8 dígitos y comenzar entre 2 y 9' },
        }}
        error={errors.phone} autoComplete="tel"
      />
 
      {/* Contraseña + Confirmar */}
      <div className="gr-row-2">
        <GrInput
          id="password" label="Contraseña" type="password" placeholder="••••••••"
          register={register}
          rules={{
            required: 'La contraseña es obligatoria',
            minLength: { value: 8,   message: 'La contraseña debe tener al menos 8 caracteres' },
            maxLength: { value: 255, message: 'La contraseña no puede superar 255 caracteres' },
            pattern:   { value: passwordPattern, message: 'La contraseña debe incluir mayúscula, minúscula, número y un carácter especial' },
          }}
          error={errors.password} autoComplete="new-password"
        />
        <GrInput
          id="passwordConfirm" label="Confirmar contraseña" type="password" placeholder="••••••••"
          register={register}
          rules={{
            required: 'Debes confirmar la contraseña',
            validate: (value) => value === password || 'Las contraseñas no coinciden',
          }}
          error={errors.passwordConfirm} autoComplete="new-password"
        />
      </div>
 
      <GrButton type="submit" loading={loading} loadingText="Registrando...">
        Crear Cuenta
      </GrButton>
 
      <GrSwitchLink
        prefixText="¿Ya tienes cuenta?"
        actionText="Iniciar Sesión"
        onClick={onSwitch}
      />
 
    </form>
  );
};