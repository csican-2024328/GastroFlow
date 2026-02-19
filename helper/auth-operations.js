import crypto from 'crypto';
import {
  checkUserExists,
  createNewUser,
  findUserByEmailOrUsername,
  updateEmailVerificationToken,
  markEmailAsVerified,
  findUserByEmail,
  updatePasswordResetToken,
  updateUserPassword,
  findUserByEmailVerificationToken,
  findUserByPasswordResetToken,
  findUserById,
} from './user-db.js';
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../utils/auth-helpers.js';
import { verifyPassword } from '../utils/password-utils.js';
import { buildUserResponse } from '../utils/user-helpers.js';
import { enviarEmailVerificacion, enviarEmailResetPassword } from './email-service.js';
import { generateJWT } from './generate-jwt.js';

const getExpirationTime = (timeString) => {
  const timeValue = parseInt(timeString);
  const timeUnit = timeString.replace(timeValue.toString(), '');

  switch (timeUnit) {
    case 's':
      return timeValue * 1000;
    case 'm':
      return timeValue * 60 * 1000;
    case 'h':
      return timeValue * 60 * 60 * 1000;
    case 'd':
      return timeValue * 24 * 60 * 60 * 1000;
    default:
      return 30 * 60 * 1000; // Default: 30 minutos
  }
};

export const registerUserHelper = async (userData) => {
  try {
    const { email, username, password, name, surname, phone, profilePicture } =
      userData;

    const userExists = await checkUserExists(email, username);
    if (userExists) {
      throw new Error(
        'Ya existe un usuario con este email o nombre de usuario'
      );
    }

    const newUser = await createNewUser({
      name,
      surname,
      username,
      email,
      password,
      phone,
      profilePicture: profilePicture,
    });

    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await updateEmailVerificationToken(
      newUser.Id,
      verificationToken,
      tokenExpiry
    );

    Promise.resolve()
      .then(() => enviarEmailVerificacion(email, name, verificationToken))
      .catch((err) =>
        console.error('Async email send (verification) failed:', err)
      );

    return {
      success: true,
      user: buildUserResponse(newUser),
      message:
        'Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.',
      emailVerificationRequired: true,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const loginUserHelper = async (emailOrUsername, password) => {
  try {
    const user = await findUserByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await verifyPassword(user.Password, password);

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.UserEmail || !user.UserEmail.EmailVerified) {
      throw new Error(
        'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada o reenvía el email de verificación.'
      );
    }

    if (!user.Status) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
    }

    const role = user.UserRoles?.[0]?.Role?.Name || 'CLIENT';

    const token = await generateJWT(user.Id.toString(), { role });

    const expiresInMs = getExpirationTime(process.env.JWT_EXPIRES_IN || '30m');
    const expiresAt = new Date(Date.now() + expiresInMs);

    const fullUser = buildUserResponse(user);
    const userDetails = {
      id: fullUser.id,
      username: fullUser.username,
      profileImage: fullUser.profileImage,
      role: fullUser.role,
    };

    return {
      success: true,
      message: 'Login exitoso',
      token,
      userDetails,
      expiresAt,
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const verifyEmailHelper = async (token) => {
  try {
    if (!token || typeof token !== 'string' || token.length < 40) {
      throw new Error('Token inválido para verificación de email');
    }

    const user = await findUserByEmailVerificationToken(token);
    if (!user) {
      throw new Error('Usuario no encontrado o token inválido');
    }

    await markEmailAsVerified(user.Id);

    return {
      success: true,
      message: 'Email verificado exitosamente',
      data: { email: user.Email, verified: true },
    };
  } catch (error) {
    console.error('Error verificando email:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    throw error;
  }
};

export const resendVerificationEmailHelper = async (email) => {
  try {
    const user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
        data: { email, sent: false },
      };
    }

    if (user.UserEmail && user.UserEmail.EmailVerified) {
      return {
        success: false,
        message: 'El email ya ha sido verificado',
        data: { email: user.Email, verified: true },
      };
    }

    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await updateEmailVerificationToken(user.Id, verificationToken, tokenExpiry);
    try {
      await enviarEmailVerificacion(user.Email, user.Name, verificationToken);
      return {
        success: true,
        message: 'Email de verificación enviado exitosamente',
        data: { email: user.Email, sent: true },
      };
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      throw new Error('Error enviando email de verificación');
    }
  } catch (error) {
    console.error('Error en resendVerificationEmail:', error);
    throw error;
  }
};

export const forgotPasswordHelper = async (email) => {
  try {
    const user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      return {
        success: false,
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones',
        data: { email, sent: false },
      };
    }

    const resetToken = await generatePasswordResetToken();
    const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

    await updatePasswordResetToken(user.Id, resetToken, tokenExpiry);

    try {
      Promise.resolve()
        .then(() => enviarEmailResetPassword(user.Email, user.Name, resetToken))
        .catch((emailError) => {
          console.error('Error sending password reset email:', emailError);
        });
    } catch (emailError) {
      console.error('Error scheduling password reset email:', emailError);
    }

    return {
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás instrucciones',
      data: { email: user.Email, sent: true },
    };
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    throw error;
  }
};

export const resetPasswordHelper = async (token, newPassword) => {
  try {
    if (!token || typeof token !== 'string' || token.length < 40) {
      throw new Error('Token inválido para reset de contraseña');
    }

    const user = await findUserByPasswordResetToken(token);
    if (!user) {
      throw new Error('Usuario no encontrado o token inválido');
    }

    const userPasswordReset = user.UserPasswordReset;
    if (!userPasswordReset || !userPasswordReset.PasswordResetToken) {
      throw new Error('Token de reset inválido o ya utilizado');
    }

    const { hashPassword } = await import('../utils/password-utils.js');
    const hashedPassword = await hashPassword(newPassword);

    await updateUserPassword(user.Id, hashedPassword);

    try {
      Promise.resolve()
        .then(() => enviarEmailContraseñaCambiada(user.Email, user.Name))
        .catch((emailError) => {
          console.error('Error sending password changed email:', emailError);
        });
    } catch (emailError) {
      console.error('Error scheduling password changed email:', emailError);
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
      data: { email: user.Email, passwordReset: true },
    };
  } catch (error) {
    console.error('Error en resetPassword:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      statusCode = 401;
    }

    throw error;
  }
};

export const getUserProfileHelper = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }
  return buildUserResponse(user);
};
