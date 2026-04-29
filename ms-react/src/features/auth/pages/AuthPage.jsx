import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';
import { AuthCard, AuthContainer } from '../../../shared/components/auth/index.js';

export const AuthPage = () => {
  const [isForgot, setIsForgot] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthContainer>
      <AuthCard
        logoSrc="/src/assets/img/Logo.png"
        logoAlt="GastroFlow"
        title={isForgot ? 'Recuperar Contraseña' : 'Bienvenido de Nuevo'}
        subtitle={
          isForgot ? 'Ingresa tu correo para recuperar contraseña' : 'Ingresa a tu cuenta de administrador GastroFlow'
        }
      >
        {isForgot ? (
          <ForgotPasswordForm
            onSwitch={() => {
              setIsForgot(false);
            }}
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