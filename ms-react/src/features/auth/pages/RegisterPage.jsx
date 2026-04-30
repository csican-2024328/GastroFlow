import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { AuthCard, AuthContainer } from '../../../shared/components/auth/index.js';

export const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <AuthContainer>
      <AuthCard
        logoSrc="/src/assets/img/Logo.png"
        logoAlt="GastroFlow"
        title="Crear cuenta"
        subtitle="Completa tus datos para registrarte en GastroFlow"
      >
        <RegisterForm onSwitch={() => navigate('/login')} />
      </AuthCard>
    </AuthContainer>
  );
};