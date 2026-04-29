import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import logo from '../../../assets/img/Logo.png';

export const VerifyEmailPage = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const token = new URLSearchParams(location.search).get('token');

    const handleFinish = useCallback(() => {
        setTimeout(() => navigate('/'), 2000);
    }, [navigate])

    const { status, message } = useVerifyEmail(token, handleFinish);

    const displayMessage =
        status === "loading" ? "Verificando correo, por favor espera..." : message;

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-[#F8F5F0] px-4">
            <img src={logo} alt="GastroFlow" className="w-28 h-28 object-contain mb-4" />

            <p
                className="text-lg font-semibold text-[#1A1A1A] text-center max-w-lg"
                aria-live="polite"
            >
                {displayMessage}
            </p>
        </div>
    )
}