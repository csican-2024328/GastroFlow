import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { resetPassword } from '../../../shared/api/auth.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';

/* ─────────────────────────────────────────
   Sub-componentes UI con estilo GastroFlow
───────────────────────────────────────── */
const ICON_MAP = {
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

export const ResetPasswordForm = ({ token, onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const password = useWatch({ control, name: 'password' });

  const onSubmit = async ({ password, passwordConfirm }) => {
    if (!token) {
      notyfError('Falta el token de recuperación. Revisa el enlace del correo.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await resetPassword({ token, password, passwordConfirm });

      notyfSuccess(data?.message || 'Tu contraseña fue actualizada correctamente.');
      onSwitch();
    } catch (error) {
      const message = error.response?.data?.message || 'No fue posible actualizar la contraseña';
      notyfError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AuthInput
        id="password"
        label="Nueva contraseña"
        type="password"
        placeholder="••••••••"
        register={register}
        rules={{
          required: 'La contraseña es obligatoria',
          minLength: {
            value: 8,
            message: 'La contraseña debe tener al menos 8 caracteres',
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

      <AuthPrimaryButton type="submit" loading={loading} loadingText="Guardando...">
        Cambiar contraseña
      </AuthPrimaryButton>

      <AuthSwitchLink prefixText="¿No era tu correo?" actionText="Volver al inicio" onClick={onSwitch} />
    </form>
  );
};