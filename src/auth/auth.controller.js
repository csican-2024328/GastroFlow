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
    if (
      error.message.includes('ya está registrado') ||
      error.message.includes('ya está en uso') ||
      error.message.includes('Ya existe un usuario')
    ) {
      statusCode = 409;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en el registro',
      error: error.message,
    });
  }
});

export const login = asyncHandler(async (req, res) => {
  try {
    const { emailOrUsername, email, username, password } = req.body;
    const credential = emailOrUsername || email || username;
    
    if (!credential || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email o Username y contraseña son requeridos',
        error: 'Credenciales incompletas',
      });
    }

    const result = await loginUserHelper(credential, password);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in login controller:', error);

    let statusCode = 401;
    if (
      error.message.includes('bloqueada') ||
      error.message.includes('desactivada')
    ) {
      statusCode = 423;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error en el login',
      error: error.message,
    });
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    const result = await verifyEmailHelper(token);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in verifyEmail controller:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error verificando email',
      error: error.message,
    });
  }
});

export const resendVerification = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendVerificationEmailHelper(email);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in resendVerification controller:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Error reenviando verificación',
      error: error.message,
    });
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordHelper(email);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Error en solicitud de reset',
      error: error.message,
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPasswordHelper(token, newPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in resetPassword controller:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al resetear contraseña',
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
