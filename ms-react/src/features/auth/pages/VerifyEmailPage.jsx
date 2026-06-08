import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from "../hooks/useVerifyEmail";

export const VerifyEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const token = new URLSearchParams(location.search).get('token');

    const handleFinish = useCallback(() => {
        setTimeout(() => navigate('/login'), 3000);
    }, [navigate])

    const { status, message } = useVerifyEmail(token, handleFinish);

    const isSuccess = !message?.toLowerCase().includes('error') && !message?.toLowerCase().includes('inválido') && status !== 'loading';

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
                            <span className="gf-plate-emoji">📧</span>
                        </div>
                    </div>

                    <div className="gf-left-content">
                        <h2 className="gf-left-headline">
                            Verifica tu <em>identidad</em><br />en segundos
                        </h2>
                        <p className="gf-left-desc">
                            Estamos validando tu correo para asegurar que tu acceso sea siempre seguro y confiable.
                        </p>
                        <div className="gf-pills">
                            <span className="gf-pill">✓ Validación</span>
                            <span className="gf-pill">📧 Email</span>
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
                            Verificación
                        </div>
                    </div>

                    <div className="gf-recovery-success fade-in slide-in-up">
                        {status === 'loading' ? (
                            <div className="flex flex-col items-center">
                                <span className="gf-spinner" style={{ width: '40px', height: '40px', marginBottom: '20px' }} />
                                <h1 className="gf-card__title">Verificando...</h1>
                                <p className="gf-card__subtitle text-center">Validando tu token de seguridad</p>
                            </div>
                        ) : (
                            <>
                                <div className={`gf-recovery-icon ${!isSuccess ? 'border-red-500/30' : ''}`}>
                                    {isSuccess ? '✓' : '✕'}
                                </div>
                                <h1 className="gf-card__title text-center">
                                    {isSuccess ? '¡Excelente!' : 'Hubo un problema'}
                                </h1>
                                <p className="gf-card__subtitle text-center">
                                    {message || (isSuccess ? 'Tu correo ha sido verificado correctamente.' : 'El enlace ha expirado o es inválido.')}
                                </p>
                                
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="gf-btn-primary"
                                    style={{ marginTop: '20px' }}
                                >
                                    Ir al Inicio de Sesión
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};