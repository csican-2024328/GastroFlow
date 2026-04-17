import {
  registerUserHelper,
  loginUserHelper,
  verifyEmailHelper,
  resendVerificationEmailHelper,
  forgotPasswordHelper,
  resetPasswordHelper,
  assignRoleHelper,
} from '../../helper/auth-operations.js';
import { getUserProfileHelper } from '../../helper/profile-operations.js';
import { findUserById, softDeleteUser } from '../../helper/user-db.js';
import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { generateJWT } from '../../helper/generate-jwt.js';
import { revokeTokenByJti } from '../../helper/session-token-store.js';

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
    const { token, password, newPassword } = req.body;
    const resolvedPassword = password || newPassword;
    const result = await resetPasswordHelper(token, resolvedPassword);

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

export const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { motivo, confirmacion } = req.body;

  if (!confirmacion || confirmacion !== true) {
    return res.status(400).json({
      success: false,
      message: 'Confirmación requerida para eliminar el usuario',
    });
  }

  if (motivo && motivo.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'El motivo no puede exceder 200 caracteres',
    });
  }

  const user = await findUserById(userId);
  if (
    user &&
    user.UserRoles &&
    user.UserRoles[0] &&
    user.UserRoles[0].Role &&
    user.UserRoles[0].Role.Name === 'PLATFORM_ADMIN'
  ) {
    return res.status(403).json({
      success: false,
      message: 'No se permite eliminar usuarios con rol PLATFORM_ADMIN',
    });
  }

  const deletedUser = await softDeleteUser(userId);
  if (!deletedUser) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado o ya eliminado',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Usuario eliminado lógicamente',
    motivo: motivo || null,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const user = req.user;
  const role = user?.UserRoles?.[0]?.Role?.Name || 'CLIENT';

  const token = await generateJWT(user.Id.toString(), { role });

  return res.status(200).json({
    success: true,
    message: 'Token refrescado exitosamente',
    token,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const jti = req.jwtPayload?.jti;
  const exp = req.jwtPayload?.exp;

  if (!jti || !exp) {
    return res.status(400).json({
      success: false,
      message: 'Token invalido para cerrar sesion',
    });
  }

  revokeTokenByJti(jti, exp);

  return res.status(200).json({
    success: true,
    message: 'Sesion cerrada exitosamente',
  });
});

/**
 * Controlador para asignar roles a un usuario
 * Solo PLATFORM_ADMIN puede asignar PLATFORM_ADMIN
 * RESTAURANT_ADMIN puede asignar RESTAURANT_ADMIN y CLIENT
 * CLIENT no puede asignar roles
 */
export const assignRole = asyncHandler(async (req, res) => {
  try {
    const { targetUserId, roleName } = req.body;
    const requestingUserId = req.usuario?.sub || req.usuario?.userId;

    if (!requestingUserId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const result = await assignRoleHelper(
      requestingUserId,
      targetUserId,
      roleName
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en assignRole controller:', error);

    let statusCode = 400;
    if (error.status) {
      statusCode = error.status;
    } else if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('ya posee') ||
      error.message.includes('no permitido')
    ) {
      statusCode = 409; // Conflict
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al asignar rol',
      error: error.message,
    });
  }
});
