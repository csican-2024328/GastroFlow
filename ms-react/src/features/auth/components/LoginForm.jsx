import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
 
/* ─────────────────────────────────────────
   Sub-componentes UI con estilo GastroFlow
   (misma API que AuthInput / AuthPrimaryButton / AuthSwitchLink)
───────────────────────────────────────── */
 
const ICON_MAP = {
  email:    'ti-mail',
  text:     'ti-user',
  password: 'ti-lock',
  tel:      'ti-phone',
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
 
const AuthPrimaryButton = ({ type = 'button', loading, loadingText, children, onClick }) => (
  <button type={type} disabled={loading} onClick={onClick} className="gf-btn-primary">
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
 
/* ─────────────────────────────────────────
   LoginForm — lógica 100 % intacta
───────────────────────────────────────── */
 
export const LoginForm = ({ onForgot, onRegister }) => {
  const navigate = useNavigate();
  const login   = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error   = useAuthStore((state) => state.error);
 
  const { register, handleSubmit, formState: { errors } } = useForm();
 
  const getLandingRouteForRole = (role) => {
    const r = (role || '').toString().trim().toUpperCase();
    if (r === 'PLATFORM_ADMIN')   return '/dashboard';
    if (r === 'RESTAURANT_ADMIN') return '/restaurant-dashboard';
    return '/cliente';
  };
 
  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      notyfSuccess('¡Bienvenido de nuevo!', { duration: 2000 });
      const role = result.data?.userDetails?.role || result.data?.role || '';
      navigate(getLandingRouteForRole(role), { replace: true });
      return;
    }
    notyfError(result.error || 'No fue posible iniciar sesión', { duration: 2000 });
  };
 
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
 
      <AuthInput
        id="emailOrUsername"
        label="Correo electrónico"
        type="email"
        placeholder="chef@gastroflow.com"
        register={register}
        rules={{ required: 'Este campo es obligatorio' }}
        error={errors.emailOrUsername}
        autoComplete="username"
      />
 
      <AuthInput
        id="password"
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        register={register}
        rules={{ required: 'La contraseña es obligatoria' }}
        error={errors.password}
        autoComplete="current-password"
      />
 
      {error && <p className="gf-error-msg" style={{ marginBottom: 8 }}>{error}</p>}
 
      {/* Olvidé contraseña alineado a la derecha */}
      <div className="gf-forgot-row">
        <button type="button" onClick={onForgot} className="gf-forgot">
          ¿Olvidaste tu contraseña?
        </button>
      </div>
 
      <AuthPrimaryButton type="submit" loading={loading} loadingText="Iniciando...">
        Ingresar al sistema
      </AuthPrimaryButton>
 
      {/* Divisor O */}
      <div className="gf-or">
        <span className="gf-or__line" />
        <span className="gf-or__text">O</span>
        <span className="gf-or__line" />
      </div>
 
      <AuthSwitchLink
        prefixText="¿Crear cuenta?"
        actionText="Solicitar acceso"
        onClick={onRegister}
      />
 
    </form>
  );
};
 