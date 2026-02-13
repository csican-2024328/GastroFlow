import nodemailer from 'nodemailer';

let transporter = null;
let smtpConfigured = false;
let initialized = false;

const createTransporter = () => {
    const username = process.env.SMTP_USERNAME?.trim();
    const password = process.env.SMTP_PASSWORD?.trim();
    const host = process.env.SMTP_HOST?.trim();
    const port = process.env.SMTP_PORT?.trim();

    if (!username || !password || !host || !port) {
        return null;
    }
    smtpConfigured = true;
    const portNum = parseInt(port);
    const isSecure = portNum === 465;
    
    return nodemailer.createTransport({
        host,
        port: portNum,
        secure: isSecure,
        auth: {
            user: username,
            pass: password,
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 10_000,
        tls: {
            rejectUnauthorized: false,
        },
    });
};

export const initializeEmailService = () => {
    if (initialized) return;
    initialized = true;
    transporter = createTransporter();
};

export const verificarConexionSMTP = async () => {
    if (!initialized) {
        initializeEmailService();
    }
    
    if (!transporter || !smtpConfigured) {
        console.log('ℹ️  Email service: SMTP no configurado. Los emails se procesarán en background.');
        return false;
    }

    try {
        await transporter.verify();
        console.log('✅ Email service: Conectado correctamente a SMTP');
        return true;
    } catch (error) {
        console.warn('⚠️  Email service: No se pudo conectar a SMTP - ' + error.message);
        console.log('ℹ️  Los emails NO se enviarán pero la aplicación continuará funcionando.');
        return false;
    }
};

export const enviarEmailVerificacion = async (email, nombre, token) => {
    if (!initialized) {
        initializeEmailService();
    }
    
    // Si SMTP no está configurado, loguear en development y continuar
    if (!transporter || !smtpConfigured) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`📧 [DEVELOPMENT] Email de verificación:`);
            console.log(`   Para: ${email}`);
            console.log(`   Nombre: ${nombre}`);
            console.log(`   Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verificar-email?token=${token.substring(0, 30)}...`);
            return { success: true, isDevelopment: true };
        }
        throw new Error('SMTP not configured');
    }

    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationUrl = `${frontendUrl}/verificar-email?token=${token}`;

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME || 'GastroFlow'} <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
            to: email,
            subject: '🔐 Verifica tu cuenta en GastroFlow',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>¡Bienvenido a GastroFlow! 🍽️</h2>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Gracias por registrarte en GastroFlow. Para completar tu registro y verificar tu cuenta, haz clic en el botón de abajo:</p>
                    
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${verificationUrl}" style="
                            background-color: #4CAF50;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                            font-weight: bold;
                        ">
                            Verificar Cuenta
                        </a>
                    </div>

                    <p>O copia este enlace en tu navegador:</p>
                    <p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
                        ${verificationUrl}
                    </p>

                    <p><strong>Este enlace expira en ${process.env.VERIFICATION_EMAIL_EXPIRY_HOURS || 24} horas.</strong></p>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #666;">
                        Si no realizaste este registro, por favor ignora este email.
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de verificación enviado a ${email}`);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('❌ Error enviando email de verificación:', error.message);
        if (process.env.NODE_ENV === 'development') {
            return { success: true, isDevelopment: true };
        }
        throw error;
    }
};

export const enviarEmailResetPassword = async (email, nombre, token) => {
    if (!initialized) {
        initializeEmailService();
    }
    
    // Si SMTP no está configurado, loguear en development y continuar
    if (!transporter || !smtpConfigured) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`📧 [DEVELOPMENT] Email de reset de contraseña:`);
            console.log(`   Para: ${email}`);
            console.log(`   Nombre: ${nombre}`);
            console.log(`   Link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token.substring(0, 30)}...`);
            return { success: true, isDevelopment: true };
        }
        throw new Error('SMTP not configured');
    }

    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME || 'GastroFlow'} <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
            to: email,
            subject: '🔑 Resetea tu contraseña en GastroFlow',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset de Contraseña 🔑</h2>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Recibimos una solicitud para resetear tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
                    
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${resetUrl}" style="
                            background-color: #2196F3;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                            font-weight: bold;
                        ">
                            Resetear Contraseña
                        </a>
                    </div>

                    <p>O copia este enlace en tu navegador:</p>
                    <p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
                        ${resetUrl}
                    </p>

                    <p style="color: #d32f2f; font-weight: bold;">
                        ⚠️ Este enlace expira en ${process.env.PASSWORD_RESET_EXPIRY_HOURS || 1} hora(s).
                    </p>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #666;">
                        Si no solicitaste un reset de contraseña, por favor ignora este email. Tu cuenta está segura.
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de reset enviado a ${email}`);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('❌ Error enviando email de reset:', error.message);
        if (process.env.NODE_ENV === 'development') {
            return { success: true, isDevelopment: true };
        }
        throw error;
    }
};

export const enviarEmailBienvenida = async (email, nombre) => {
    if (!initialized) {
        initializeEmailService();
    }
    
    // Si SMTP no está configurado, loguear en development y continuar
    if (!transporter || !smtpConfigured) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`📧 [DEVELOPMENT] Email de bienvenida:`);
            console.log(`   Para: ${email}`);
            console.log(`   Nombre: ${nombre}`);
            return { success: true, isDevelopment: true };
        }
        throw new Error('SMTP not configured');
    }

    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME || 'GastroFlow'} <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
            to: email,
            subject: '🎉 ¡Bienvenido a GastroFlow!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>¡Cuenta Verificada! 🎉</h2>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Tu cuenta ha sido verificada exitosamente. Ya puedes disfrutar de todos los beneficios de GastroFlow:</p>
                    
                    <ul style="line-height: 1.8;">
                        <li>🍽️ Reservar en los mejores restaurantes</li>
                        <li>⭐ Calificar y comentar restaurantes</li>
                        <li>🔔 Recibir notificaciones especiales</li>
                        <li>💳 Gestionar tus reservaciones</li>
                    </ul>

                    <p style="margin-top: 30px; text-align: center;">
                        <a href="${frontendUrl}" style="
                            background-color: #4CAF50;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                            font-weight: bold;
                        ">
                            Ir a GastroFlow
                        </a>
                    </p>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #666;">
                        Si tienes preguntas, contactanos en support@gastroflow.com
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de bienvenida enviado a ${email}`);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('❌ Error enviando email de bienvenida:', error.message);
        if (process.env.NODE_ENV === 'development') {
            return { success: true, isDevelopment: true };
        }
        throw error;
    }
};

export const enviarEmailContraseñaCambiada = async (email, nombre) => {
    if (!initialized) {
        initializeEmailService();
    }
    
    // Si SMTP no está configurado, loguear en development y continuar
    if (!transporter || !smtpConfigured) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`📧 [DEVELOPMENT] Email de contraseña cambiada:`);
            console.log(`   Para: ${email}`);
            console.log(`   Nombre: ${nombre}`);
            return { success: true, isDevelopment: true };
        }
        throw new Error('SMTP not configured');
    }

    try {
        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME || 'GastroFlow'} <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
            to: email,
            subject: '🔐 Tu contraseña ha sido cambiada',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Contraseña Actualizada 🔐</h2>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Tu contraseña ha sido actualizada exitosamente.</p>
                    <p>Si no realizaste este cambio, por favor contacta con nuestro equipo de soporte inmediatamente.</p>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #666;">
                        Este es un email automático. Por favor, no respondas a este mensaje.
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de cambio de contraseña enviado a ${email}`);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('❌ Error enviando email de cambio de contraseña:', error.message);
        if (process.env.NODE_ENV === 'development') {
            return { success: true, isDevelopment: true };
        }
        throw error;
    }
};
