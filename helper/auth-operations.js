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

    // Enviar email de verificación en background, sin bloquear el registro
    Promise.resolve()
      .then(() => enviarEmailVerificacion(email, name, verificationToken))
      .catch((err) => {
        console.error('❌ Error enviando email de verificación en background:', err.message);
      });

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
    // Validación estricta del token
    if (!token || typeof token !== 'string' || token.trim().length < 40) {
      throw new Error('Token inválido para verificación de email: formato incorrecto');
    }

    const user = await findUserByEmailVerificationToken(token.trim());
    if (!user) {
      throw new Error('Usuario no encontrado o token inválido');
    }

    // Verificar si el email ya está verificado
    if (user.UserEmail && user.UserEmail.EmailVerified) {
      throw new Error('El email ya ha sido verificado previamente');
    }

    // Verificar si el token ha expirado
    if (user.UserEmail?.EmailVerificationTokenExpiry) {
      const now = new Date();
      const expiry = new Date(user.UserEmail.EmailVerificationTokenExpiry);
      if (now > expiry) {
        throw new Error('El token de verificación ha expirado');
      }
    }

    // Marcar email como verificado
    await markEmailAsVerified(user.Id);

    console.log(`Email verificado exitosamente para usuario: ${user.Email}`);

    return {
      success: true,
      message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
      data: { 
        email: user.Email, 
        verified: true,
        userId: user.Id,
      },
    };
  } catch (error) {
    console.error('Error verificando email:', error.message);
    throw error;
  }
};

export const resendVerificationEmailHelper = async (email) => {
  try {
    const cleanEmail = email.toLowerCase().trim();

    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      // No revelar que el email no existe (seguridad)
      return {
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás el email de verificación',
        data: { email: cleanEmail, sent: true },
      };
    }

    // Verificar si el email ya está verificado
    if (user.UserEmail && user.UserEmail.EmailVerified) {
      return {
        success: false,
        message: 'El email ya ha sido verificado. Puedes iniciar sesión directamente.',
        data: { email: user.Email, verified: true },
      };
    }

    // Generar nuevo token de verificación
    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await updateEmailVerificationToken(user.Id, verificationToken, tokenExpiry);

    try {
      await enviarEmailVerificacion(user.Email, user.Name, verificationToken);
      console.log(`✅ Email de re-verificación enviado a ${user.Email}`);
      return {
        success: true,
        message: 'Email de verificación enviado exitosamente',
        data: { email: user.Email, sent: true },
      };
    } catch (emailError) {
      console.error('❌ Error enviando email de verificación:', emailError.message);
      // No revelar detalhes del error SMTP al cliente
      throw new Error('Error enviando email de verificación. Por favor intenta más tarde.');
    }
  } catch (error) {
    console.error('Error en resendVerificationEmail:', error.message);
    throw error;
  }
};

export const forgotPasswordHelper = async (email) => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      // No revelar si el email existe o no por seguridad
      return {
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones por correo',
        data: { email: cleanEmail, sent: false },
      };
    }

    const resetToken = await generatePasswordResetToken();
    const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

    await updatePasswordResetToken(user.Id, resetToken, tokenExpiry);

    // Enviar email de reset en background
    Promise.resolve()
      .then(() => enviarEmailResetPassword(user.Email, user.Name, resetToken))
      .catch((emailError) => {
        console.error('❌ Error enviando email de reset de contraseña:', emailError.message);
      });

    return {
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás instrucciones por correo',
      data: { email: user.Email, sent: true },
    };
  } catch (error) {
    console.error('Error en forgotPassword:', error.message);
    throw error;
  }
};

export const resetPasswordHelper = async (token, newPassword) => {
  try {
    // Validaciones estrictas del token
    if (!token || typeof token !== 'string' || token.trim().length < 40) {
      throw new Error('Token inválido para reset de contraseña: formato incorrecto');
    }

    const user = await findUserByPasswordResetToken(token.trim());
    if (!user) {
      throw new Error('Usuario no encontrado o token inválido');
    }

    const userPasswordReset = user.UserPasswordReset;
    if (!userPasswordReset || !userPasswordReset.PasswordResetToken) {
      throw new Error('Token de reset inválido o ya utilizado');
    }

    // Verificar si el token ha expirado
    if (userPasswordReset.PasswordResetTokenExpiry) {
      const now = new Date();
      const expiry = new Date(userPasswordReset.PasswordResetTokenExpiry);
      if (now > expiry) {
        throw new Error('El token de reset ha expirado');
      }
    }

    const { hashPassword } = await import('../utils/password-utils.js');
    const hashedPassword = await hashPassword(newPassword);

    await updateUserPassword(user.Id, hashedPassword);

    console.log(`✅ Contraseña reseteada exitosamente para usuario: ${user.Email}`);

    // Enviar email de confirmación en background
    Promise.resolve()
      .then(() => enviarEmailContraseñaCambiada(user.Email, user.Name))
      .catch((emailError) => {
        console.error('❌ Error enviando email de cambio de contraseña:', emailError.message);
      });

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente. Puedes iniciar sesión con tu nueva contraseña.',
      data: { email: user.Email, passwordReset: true },
    };
  } catch (error) {
    console.error('Error en resetPassword:', error.message);
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
