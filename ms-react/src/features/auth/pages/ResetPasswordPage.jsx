import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '../components/ResetPasswordForm.jsx';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
              Recupera el <em>control</em><br />de tu cuenta
            </h2>
            <p className="gf-left-desc">
              Define una nueva contraseña segura para seguir gestionando tu restaurante sin interrupciones.
            </p>
            <div className="gf-pills">
              <span className="gf-pill">🔒 Seguridad</span>
              <span className="gf-pill">🔄 Restablecer</span>
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
              <span className="gf-logo__sub">PREMIUM SYSTEM</span>
            </div>
            <div className="gf-status">
              <span className="gf-status__dot" />
              Seguridad activa
            </div>
          </div>

          <h1 className="gf-card__title">Nueva Contraseña</h1>
          <p className="gf-card__subtitle">
            Ingresa y confirma tu nueva clave de acceso
          </p>

          <ResetPasswordForm token={token} onSwitch={() => navigate('/login')} />
        </div>

      </div>
    </div>
  );
};