import User from './User.model.js';
import jwt from 'jsonwebtoken';
import { enviarEmailVerificacion, enviarEmailResetPassword, enviarEmailBienvenida, enviarEmailContraseñaCambiada } from '../../helper/email-service.js';

export const registro = async (req, res) => {
    try {
        const { name, surname, email, password, phone, role = 'CLIENT' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor completa los campos requeridos (name, email, password)'
            });
        }

        const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
        if (usuarioExistente) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        const nuevoUsuario = new User({
            name,
            surname,
            email: email.toLowerCase(),
            password,
            phone,
            role
        });

        const tokenVerificacion = nuevoUsuario.generarVerificationToken();
        await nuevoUsuario.save();
        const emailEnviado = await enviarEmailVerificacion(
            email,
            name,
            tokenVerificacion
        );

        if (!emailEnviado.success) {
            console.warn('Email de verificación no se envió, pero usuario fue registrado');
        }
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente. Por favor verifica tu email para activar la cuenta.',
            data: {
                usuario: {
                    id: nuevoUsuario._id,
                    name: nuevoUsuario.name,
                    email: nuevoUsuario.email,
                    role: nuevoUsuario.role,
                    status: nuevoUsuario.status,
                    emailVerified: nuevoUsuario.emailVerified
                }
            },
            info: 'Se ha enviado un email de verificación. Revisa tu bandeja de entrada.'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        const usuario = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        if (!usuario.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Tu cuenta está inactiva. Por favor verifica tu email para activar la cuenta.',
                usuarioId: usuario._id,
                emailVerificado: false
            });
        }

        if (usuario.status === 'INACTIVO') {
            return res.status(403).json({
                success: false,
                message: 'Tu cuenta ha sido desactivada por el administrador',
                usuarioId: usuario._id
            });
        }

        if (usuario.status === 'SUSPENDIDO') {
            return res.status(403).json({
                success: false,
                message: 'Tu cuenta ha sido suspendida',
                usuarioId: usuario._id
            });
        }

        const passwordValido = await usuario.matchPassword(password);
        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        usuario.lastLogin = new Date();
        await usuario.save();
        const token = usuario.generarJWT();
        const refreshToken = usuario.generarRefreshJWT();
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                usuario: {
                    id: usuario._id,
                    name: usuario.name,
                    email: usuario.email,
                    role: usuario.role,
                    phone: usuario.phone
                },
                token,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el login',
            error: error.message
        });
    }
};

export const verificarEmail = async (req, res) => {
    try {
        const token = req.query.token || req.body.token;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token de verificación es requerido (usa ?token=... en la URL o envía en el body)'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.tipo !== 'email_verification') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        const usuario = await User.findById(decoded.id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (usuario.emailVerified) {
            return res.status(200).json({
                success: true,
                message: 'El email ya estaba verificado',
                usuario: {
                    id: usuario._id,
                    email: usuario.email,
                    emailVerificado: usuario.emailVerified,
                    status: usuario.status
                }
            });
        }

        usuario.emailVerified = true;
        usuario.status = 'ACTIVO';
        usuario.verificationToken = null;
        await usuario.save();
        await enviarEmailBienvenida(usuario.email, usuario.name);
        const tokenAcceso = usuario.generarJWT();
        const tokenRefresco = usuario.generarRefreshJWT();

        res.status(200).json({
            success: true,
            message: 'Email verificado exitosamente. ¡Bienvenido a GastroFlow!',
            data: {
                usuario: {
                    id: usuario._id,
                    name: usuario.name,
                    email: usuario.email,
                    role: usuario.role,
                    emailVerificado: usuario.emailVerified,
                    status: usuario.status
                },
                token: tokenAcceso,
                refreshToken: tokenRefresco
            }
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token de verificación expirado. Por favor solicita uno nuevo.',
                codigoError: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token de verificación inválido'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al verificar email',
            error: error.message
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token requerido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });

        if (decoded.tipo !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        const usuario = await User.findById(decoded.id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const nuevoToken = usuario.generarJWT();

        res.status(200).json({
            success: true,
            message: 'Token renovado',
            data: {
                token: nuevoToken
            }
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expirado'
            });
        }
        
        res.status(401).json({
            success: false,
            message: 'Token inválido',
            error: error.message
        });
    }
};

export const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await User.findById(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                usuario: {
                    id: usuario._id,
                    name: usuario.name,
                    surname: usuario.surname,
                    email: usuario.email,
                    phone: usuario.phone,
                    address: usuario.address,
                    profileImage: usuario.profileImage,
                    role: usuario.role,
                    status: usuario.status,
                    emailVerified: usuario.emailVerified,
                    lastLogin: usuario.lastLogin,
                    preferences: usuario.preferences,
                    createdAt: usuario.createdAt
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil',
            error: error.message
        });
    }
};

export const actualizarPerfil = async (req, res) => {
    try {
        const { name, surname, phone, address, profileImage } = req.body;

        const usuario = await User.findByIdAndUpdate(
            req.usuario.id,
            {
                $set: {
                    name: name || undefined,
                    surname: surname || undefined,
                    phone: phone || undefined,
                    address: address || undefined,
                    profileImage: profileImage || undefined
                }
            },
            { new: true, runValidators: true }
        );

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                usuario: {
                    id: usuario._id,
                    name: usuario.name,
                    surname: usuario.surname,
                    email: usuario.email,
                    phone: usuario.phone,
                    address: usuario.address,
                    profileImage: usuario.profileImage
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil',
            error: error.message
        });
    }
};

export const cambiarContraseña = async (req, res) => {
    try {
        const { passwordActual, passwordNueva } = req.body;

        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({
                success: false,
                message: 'Contrasena actual y nueva son requeridas'
            });
        }

        const usuario = await User.findById(req.usuario.id).select('+password');

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const esValida = await usuario.matchPassword(passwordActual);
        if (!esValida) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        usuario.password = passwordNueva;
        await usuario.save();
        await enviarEmailContraseñaCambiada(usuario.email, usuario.name);

        res.status(200).json({
            success: true,
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};

export const solicitarResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const usuario = await User.findOne({ email: email.toLowerCase() });
        if (!usuario) {
            return res.status(200).json({
                success: true,
                message: 'Si el email existe en nuestro sistema, recibirás un enlace para resetear tu contraseña'
            });
        }

        const resetToken = usuario.generarResetPasswordToken();
        await usuario.save();
        const emailEnviado = await enviarEmailResetPassword(
            usuario.email,
            usuario.name,
            resetToken
        );

        if (!emailEnviado.success) {
            console.error('Error enviando email de reset:', emailEnviado.error);
            return res.status(503).json({
                success: false,
                message: 'No se pudo enviar el email de reset. Por favor intenta más tarde.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Se ha enviado un email con instrucciones para resetear tu contraseña',
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });

    } catch (error) {
        console.error('Error al solicitar reset:', error);
        res.status(500).json({
            success: false,
            message: 'Error al solicitar reset de contraseña',
            error: error.message
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { passwordNueva } = req.body;

        if (!passwordNueva) {
            return res.status(400).json({
                success: false,
                message: 'Nueva contraseña es requerida'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });

        if (decoded.tipo !== 'password_reset') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        if (new Date() > new Date(decoded.exp * 1000)) {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        const usuario = await User.findById(decoded.id);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        usuario.password = passwordNueva;
        usuario.resetPasswordToken = undefined;
        usuario.resetPasswordExpires = undefined;
        await usuario.save();

        res.status(200).json({
            success: true,
            message: 'Contraseña resetada exitosamente'
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Token inválido',
            error: error.message
        });
    }
};

export const logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logout exitoso. Por favor elimina el token del localStorage/sessionStorage'
    });
};
