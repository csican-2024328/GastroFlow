import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';
import { AuthCard, AuthContainer } from '../../../shared/components/auth/index.js';

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

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [recoverySent]);

  return (
    <AuthContainer>
      <AuthCard
        logoSrc="/src/assets/img/Logo.png"
        logoAlt="GastroFlow"
        title={recoverySent ? 'Correo enviado' : isForgot ? 'Recuperar Contraseña' : 'Bienvenido de Nuevo'}
        subtitle={
          recoverySent
            ? 'Revisa tu bandeja de entrada y abre el enlace para crear tu nueva contraseña.'
            : isForgot
              ? 'Ingresa tu correo para recuperar contraseña'
              : 'Ingresa a tu cuenta de administrador GastroFlow'
        }
      >
        {recoverySent ? (
          <div className="fade-in slide-in-up text-center space-y-4 py-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-[var(--gf-green)]/10 flex items-center justify-center border border-[var(--gf-beige)]">
              <span className="text-2xl text-[var(--gf-green)]">✓</span>
            </div>
            <p className="text-sm text-[#4b4b4b] leading-relaxed">
              Te enviamos un correo con el enlace para restablecer tu contraseña.
              <br />
              Ahora puedes continuar cuando abras el correo.
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
      </AuthCard>
    </AuthContainer>
  );
};