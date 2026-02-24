import {
  registerUserHelper,
  loginUserHelper,
  verifyEmailHelper,
  resendVerificationEmailHelper,
  forgotPasswordHelper,
  resetPasswordHelper,
} from '../../helper/auth-operations.js';
import { getUserProfileHelper } from '../../helper/profile-operations.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';

export const register = asyncHandler(async (req, res) => {
  try {
    const userData = {
      ...req.body,
      profilePicture: req.file ? req.file.path : null,
    };

    const result = await registerUserHelper(userData);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in register controller:', error);

    let statusCode = 400;
    let message = 'Error en el registro';

    if (
      error.message.includes('ya está registrado') ||
      error.message.includes('ya está en uso') ||
      error.message.includes('Ya existe un usuario')
    ) {
      statusCode = 409;
      message = 'El email o nombre de usuario ya están registrados';
    } else if (error.message.includes('Email') || error.message.includes('email')) {
      statusCode = 400;
      message = 'Error en el formato del email';
    } else if (error.message.includes('Password') || error.message.includes('contraseña')) {
      statusCode = 400;
      message = 'La contraseña no cumple con los requisitos de seguridad';
    } else if (error.message.includes('teléfono') || error.message.includes('phone')) {
      statusCode = 400;
      message = 'El número de teléfono no tiene un formato válido';
    } else if (error.message.includes('mail')) {
      statusCode = 503;
      message = 'El registro fue exitoso pero hubo un problema al enviar el email de verificación. Puedes pedir que se reenvíe.';
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      error: error.message,
    });
  }
});

export const login = asyncHandler(async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'El email/usuario y contraseña son requeridos',
        error: 'Ambos campos son obligatorios.',
      });
    }

    const result = await loginUserHelper(emailOrUsername, password);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in login controller:', error);

    let statusCode = 401;
    let message = 'Credenciales inválidas';

    if (error.message.includes('verificar')) {
      statusCode = 403;
      message = 'Debes verificar tu email antes de iniciar sesión';
    } else if (error.message.includes('desactivada')) {
      statusCode = 423;
      message = 'Tu cuenta está desactivada';
    } else if (error.message.includes('bloqueada')) {
      statusCode = 423;
      message = 'Tu cuenta está bloqueada';
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      error: error.message,
    });
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación inválido o ausente',
        error: 'El token es requerido y debe ser una cadena válida.',
      });
    }

    const result = await verifyEmailHelper(token);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in verifyEmail controller:', error);

    let statusCode = 400;
    let message = 'Error verificando email';

    if (error.message.includes('no encontrado') || error.message.includes('Usuario no encontrado')) {
      statusCode = 404;
      message = 'El token de verificación no es válido o ha expirado';
    } else if (error.message.includes('inválido') || error.message.includes('Token inválido')) {
      statusCode = 401;
      message = 'Token de verificación inválido o expirado';
    } else if (error.message.includes('expirado')) {
      statusCode = 401;
      message = 'El token de verificación ha expirado';
    } else if (error.message.includes('verificado')) {
      statusCode = 409;
      message = 'Este email ya ha sido verificado';
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      error: error.message,
    });
  }
});

export const resendVerification = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es requerido',
        error: 'El email debe ser una cadena válida.',
      });
    }

    const result = await resendVerificationEmailHelper(email.trim());

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in resendVerification controller:', error);

    let statusCode = 500;
    let message = 'Error reenviando email de verificación';

    if (error.message.includes('mail')) {
      statusCode = 503;
      message = 'Servicio de email no disponible. Por favor intenta más tarde.';
    } else if (error.message.includes('timeout') || error.message.includes('SMTP')) {
      statusCode = 503;
      message = 'Timeout del servidor de email. Por favor intenta más tarde.';
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      error: error.message,
    });
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es requerido',
        error: 'El email debe ser una cadena válida.',
      });
    }

    const result = await forgotPasswordHelper(email.trim());

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);

    res.status(500).json({
      success: false,
      message: 'Error en solicitud de reset de contraseña',
      error: error.message,
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, password, passwordConfirm } = req.body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token de reset inválido o ausente',
        error: 'El token es requerido.',
      });
    }

    if (!password || password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden o son inválidas',
        error: 'Las contraseñas debe coincidir.',
      });
    }

    const result = await resetPasswordHelper(token.trim(), password);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in resetPassword controller:', error);

    let statusCode = 400;
    let message = 'Error al resetear contraseña';

    if (error.message.includes('no encontrado') || error.message.includes('Usuario no encontrado')) {
      statusCode = 404;
      message = 'El token de reset no es válido o no existe';
    } else if (error.message.includes('inválido') || error.message.includes('Token inválido')) {
      statusCode = 401;
      message = 'Token de reset inválido o expirado';
    } else if (error.message.includes('expirado')) {
      statusCode = 401;
      message = 'El token de reset ha expirado. Solicita uno nuevo.';
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      error: error.message,
    });
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const user = await getUserProfileHelper(userId);

  return res.status(200).json({
    success: true,
    message: 'Perfil obtenido exitosamente',
    data: user,
  });
});

export const getProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'El userId es requerido',
    });
  }

  const user = await getUserProfileHelper(userId);

  return res.status(200).json({
    success: true,
    user,
  });
});
