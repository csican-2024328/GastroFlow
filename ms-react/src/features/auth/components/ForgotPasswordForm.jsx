import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../../shared/api/auth.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

/* ─────────────────────────────────────────
   Sub-componentes UI con estilo GastroFlow
───────────────────────────────────────── */
const ICON_MAP = {
  email:    'ti-mail',
  text:     'ti-user',
  password: 'ti-lock',
};

const AuthInput = ({ id, label, type = 'text', placeholder, register, rules, error, autoComplete }) => (
  <div className="gf-field">
    {label && <label htmlFor={id} className="gf-label">{label}</label>}
    <div className="gf-input-wrap">
      <i className={`ti ${ICON_MAP[type] ?? 'ti-user'} gf-input-icon`} aria-hidden="true" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`gf-input${error ? ' gf-input--error' : ''}`}
        {...register(id, rules)}
      />
    </div>
    {error && <span className="gf-error-msg">{error.message}</span>}
  </div>
);

const AuthPrimaryButton = ({ type = 'button', loading, loadingText, children }) => (
  <button type={type} disabled={loading} className="gf-btn-primary">
    <span className="gf-btn-primary__shimmer" />
    {loading
      ? <><span className="gf-spinner" />{loadingText ?? 'Cargando...'}</>
      : children}
  </button>
);

const AuthSwitchLink = ({ prefixText, actionText, onClick }) => (
  <p className="gf-switch-link">
    {prefixText && <span>{prefixText} </span>}
    <button type="button" onClick={onClick} className="gf-switch-link__action">
      {actionText}
    </button>
  </p>
);

export const ForgotPasswordForm = ({ onSwitch, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      const { data } = await forgotPassword({ email });

      notyfSuccess(data?.message || 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.');
      onSuccess?.();
    } catch (error) {
      const message = error.response?.data?.message || 'No fue posible enviar el correo de recuperación';
      notyfError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthInput
        id="email"
        label="Email"
        type="email"
        placeholder="correo@ejemplo.com"
        register={register}
        rules={{
          required: 'El email es obligatorio',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Ingresa un email válido' },
        }}
        error={errors.email}
        autoComplete="email"
      />

      <AuthPrimaryButton type="submit" loading={loading} loadingText="Enviando...">
        Enviar Correo
      </AuthPrimaryButton>

      <AuthSwitchLink
        prefixText="¿Recordaste tu contraseña?"
        actionText="Iniciar Sesión"
        onClick={onSwitch}
      />
    </form>
  );
};