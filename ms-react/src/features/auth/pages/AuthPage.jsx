import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';
 
export const AuthPage = () => {
  const [isForgot, setIsForgot] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const navigate = useNavigate();
 
  useEffect(() => {
    let timeoutId;
    if (recoverySent) {
      timeoutId = window.setTimeout(() => {
        setRecoverySent(false);
        setIsForgot(false);
      }, 2200);
    }
    return () => { if (timeoutId) window.clearTimeout(timeoutId); };
  }, [recoverySent]);
 
  return (
    <div className="gf-auth-container">
      <div className="gf-auth-wrapper fade-in">
 
        {/* ══ PANEL IZQUIERDO ══ */}
        <div className="gf-auth-left">
          <div className="gf-bg-art" />
 
          <div className="gf-orbits">
            <div className="gf-orbit gf-orbit--1"><span className="gf-orbit-dot gf-orbit-dot--gold" /></div>
            <div className="gf-orbit gf-orbit--2"><span className="gf-orbit-dot gf-orbit-dot--green" /></div>
          </div>
 
          <div className="gf-plate">
            <div className="gf-plate-inner">
              <span className="gf-plate-emoji">🍽️</span>
            </div>
          </div>
 
          <div className="gf-left-content">
            <h2 className="gf-left-headline">
              El <em>flujo perfecto</em><br />de tu cocina
            </h2>
            <p className="gf-left-desc">
              Controla pedidos, mesas, inventario y personal desde un solo lugar. Elegante, ágil y poderoso.
            </p>
            <div className="gf-pills">
              <span className="gf-pill">🧾 Pedidos en vivo</span>
              <span className="gf-pill">📊 Reportes</span>
              <span className="gf-pill">👨‍🍳 Cocina</span>
            </div>
          </div>
 
          <span className="gf-card-corner gf-card-corner--tl" />
          <span className="gf-card-corner gf-card-corner--bl" />
        </div>
 
        {/* ══ DIVISOR ══ */}
        <div className="gf-auth-divider" />
 
        {/* ══ PANEL DERECHO ══ */}
        <div className="gf-auth-card">
          <span className="gf-card-corner gf-card-corner--tr" />
          <span className="gf-card-corner gf-card-corner--br" />
 
          {/* Logo */}
          <div className="gf-logo">
            <div className="gf-logo__mark">
              <img
                src="/src/assets/img/Logo.png"
                alt="GastroFlow"
                className="gf-logo__img"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="gf-logo__text">
              <span className="gf-logo__name">GastroFlow</span>
              <span className="gf-logo__sub">AS LAGO</span>
            </div>
            <div className="gf-status">
              <span className="gf-status__dot" />
              Sistema activo
            </div>
          </div>
 
          {/* Título dinámico */}
          <h1 className="gf-card__title">
            {recoverySent
              ? 'Correo enviado'
              : isForgot
                ? 'Recuperar Contraseña'
                : 'Bienvenido de vuelta'}
          </h1>
          <p className="gf-card__subtitle">
            {recoverySent
              ? 'Revisa tu bandeja de entrada y abre el enlace para crear tu nueva contraseña.'
              : isForgot
                ? 'Ingresa tu correo para recuperar contraseña'
                : 'Ingresa tus credenciales para continuar'}
          </p>
 
          {/* Contenido dinámico — LÓGICA INTACTA */}
          {recoverySent ? (
            <div className="fade-in slide-in-up gf-recovery-success">
              <div className="gf-recovery-icon">✓</div>
              <p className="gf-recovery-text">
                Te enviamos un correo con el enlace para restablecer tu contraseña.
                <br />Ahora puedes continuar cuando abras el correo.
              </p>
            </div>
          ) : isForgot ? (
            <ForgotPasswordForm
              onSuccess={() => setRecoverySent(true)}
              onSwitch={() => setIsForgot(false)}
            />
          ) : (
            <LoginForm
              onForgot={() => setIsForgot(true)}
              onRegister={() => navigate('/register')}
            />
          )}
        </div>
 
      </div>
    </div>
  );
};
 