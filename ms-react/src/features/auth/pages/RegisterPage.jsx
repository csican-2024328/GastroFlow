import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm.jsx';
import '../../../styles/register.css';

export const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="gr-container">
      <div className="gr-wrapper fade-in">
        
        {/* Panel Izquierdo: Formulario */}
        <div className="gr-left">
          {/* Esquinas decorativas */}
          <div className="gr-corner gr-corner--tl" />
          <div className="gr-corner gr-corner--tr" />
          <div className="gr-corner gr-corner--bl" />
          <div className="gr-corner gr-corner--br" />

          {/* Header / Logo */}
          <header className="gr-logo">
            <div className="gr-logo__mark">
              <img src="/src/assets/img/Logo.png" alt="GastroFlow" className="gr-logo__img" />
            </div>
            <div className="gr-logo__text">
              <span className="gr-logo__name">GastroFlow</span>
              <span className="gr-logo__sub">PREMIUM SYSTEM</span>
            </div>
            <div className="gr-status">
              <div className="gr-status__dot" />
              <span>SISTEMA ACTIVO</span>
            </div>
          </header>

          <h1 className="gr-title">Crear cuenta</h1>
          <p className="gr-subtitle">
            Únete a la red de gestión gastronómica más avanzada. 
            Completa los datos para comenzar.
          </p>

          <RegisterForm onSwitch={() => navigate('/login')} />
        </div>

        <div className="gr-divider" />

        {/* Panel Derecho: Features / Branding */}
        <div className="gr-right">
          <div>
            <p className="gr-right-tagline">Elevando la gestión culinaria</p>
            
            <div className="gr-feature">
              <div className="gr-feat-icon"><i className="ti ti-chart-bar" /></div>
              <div>
                <p className="gr-feat-name">Analítica Avanzada</p>
                <p className="gr-feat-desc">Control total sobre tus ventas y rendimientos en tiempo real.</p>
              </div>
            </div>

            <div className="gr-feature">
              <div className="gr-feat-icon"><i className="ti ti-package" /></div>
              <div>
                <p className="gr-feat-name">Gestión de Inventario</p>
                <p className="gr-feat-desc">Automatización de stock y alertas de reposición inteligentes.</p>
              </div>
            </div>

            <div className="gr-feature">
              <div className="gr-feat-icon"><i className="ti ti-users" /></div>
              <div>
                <p className="gr-feat-name">Multi-Usuario</p>
                <p className="gr-feat-desc">Roles personalizados para cada miembro de tu equipo.</p>
              </div>
            </div>
          </div>

          <div className="gr-testimonial">
            <p className="gr-quote">
              "GastroFlow ha transformado por completo la eficiencia operativa de nuestra cadena de restaurantes."
            </p>
            <div className="gr-quote-author">
              <div className="gr-author-avatar">AM</div>
              <div>
                <p className="gr-author-name">Andrés Mendoza</p>
                <p className="gr-author-resto">Director Ejecutivo, Grupo Sabor</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};