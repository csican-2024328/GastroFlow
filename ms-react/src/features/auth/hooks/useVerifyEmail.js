import { useEffect, useState } from 'react';
import { verifyEmail } from '../../../shared/api/auth.js';

export const useVerifyEmail = (token, onSuccess) => {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Falta el token de verificación. Revisa el enlace del correo.');
        return;
      }

      try {
        setStatus('loading');

        const { data } = await verifyEmail({ token });

        setStatus('success');
        setMessage(data?.message || 'Correo verificado correctamente. Ya puedes iniciar sesión.');

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'No fue posible verificar el correo. El enlace puede haber expirado.'
        );
      }
    };

    runVerification();
  }, [onSuccess, token]);

  return { status, message };
};