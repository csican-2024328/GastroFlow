import { body, validationResult } from 'express-validator';

/**
 * Middleware para validar errores de validación
 * Debe ser usado DESPUÉS de todos los validadores
 */
export const validarCampos = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg,
            }))
        });
    }

    next();
};

/**
 * Validadores para REGISTRO de usuario
 * Incluye validaciones de nombre, apellido, email, teléfono y contraseña
 */
export const validateRegister = [
    // Validación de Nombre
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio.')
        .isLength({ min: 2, max: 25 })
        .withMessage('El nombre debe tener entre 2 y 25 caracteres.')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios.'),

    // Validación de Apellido
    body('surname')
        .trim()
        .notEmpty()
        .withMessage('El apellido es obligatorio.')
        .isLength({ min: 2, max: 25 })
        .withMessage('El apellido debe tener entre 2 y 25 caracteres.')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El apellido solo puede contener letras y espacios.'),

    // Validación de Nombre de Usuario
    body('username')
        .trim()
        .notEmpty()
        .withMessage('El nombre de usuario es obligatorio.')
        .isLength({ min: 3, max: 50 })
        .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres.')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.'),

    // Validación de Email
    body('email')
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage('El correo electrónico es obligatorio.')
        .isEmail()
        .withMessage('El correo electrónico no tiene un formato válido.')
        .isLength({ min: 5, max: 150 })
        .withMessage('El correo electrónico debe tener entre 5 y 150 caracteres.')
        .normalizeEmail(),

    // Validación de Teléfono
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('El número de teléfono es obligatorio.')
        .matches(/^\d{8}$/)
        .withMessage('El número de teléfono debe tener exactamente 8 dígitos.')
        .matches(/^[2-9]/)
        .withMessage('El número de teléfono debe comenzar con un dígito entre 2 y 9.'),

    // Validación de Contraseña
    body('password')
        .trim()
        .notEmpty()
        .withMessage('La contraseña es obligatoria.')
        .isLength({ min: 8, max: 255 })
        .withMessage('La contraseña debe tener entre 8 y 255 caracteres.')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una mayúscula.')
        .matches(/[a-z]/)
        .withMessage('La contraseña debe contener al menos una minúscula.')
        .matches(/[0-9]/)
        .withMessage('La contraseña debe contener al menos un número.')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('La contraseña debe contener al menos un carácter especial (!@#$%^&*...).'),

    // Validación de Confirmación de Contraseña
    body('passwordConfirm')
        .trim()
        .notEmpty()
        .withMessage('La confirmación de contraseña es obligatoria.')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden.');
            }
            return true;
        }),
];

/**
 * Validadores para LOGIN
 * Incluye validaciones de email/username y contraseña
 */
export const validateLogin = [
    // Validación de Email o Username
    body('emailOrUsername')
        .trim()
        .notEmpty()
        .withMessage('El correo electrónico o nombre de usuario es obligatorio.')
        .isLength({ min: 3 })
        .withMessage('El correo electrónico o nombre de usuario debe tener mínimo 3 caracteres.'),

    // Validación de Contraseña
    body('password')
        .trim()
        .notEmpty()
        .withMessage('La contraseña es obligatoria.')
        .isLength({ min: 1 })
        .withMessage('La contraseña no puede estar vacía.'),
];

/**
 * Validadores para VERIFICACIÓN DE EMAIL
 */
export const validateVerifyEmail = [
    body('token')
        .trim()
        .notEmpty()
        .withMessage('El token de verificación es obligatorio.')
        .isLength({ min: 1 })
        .withMessage('El token no puede estar vacío.'),
];

/**
 * Validadores para REENVÍO DE VERIFICACIÓN
 */
export const validateResendVerification = [
    body('email')
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage('El correo electrónico es obligatorio.')
        .isEmail()
        .withMessage('El correo electrónico no tiene un formato válido.')
        .normalizeEmail(),
];

/**
 * Validadores para OLVIDO DE CONTRASEÑA
 */
export const validateForgotPassword = [
    body('email')
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage('El correo electrónico es obligatorio.')
        .isEmail()
        .withMessage('El correo electrónico no tiene un formato válido.')
        .normalizeEmail(),
];

/**
 * Validadores para RESET DE CONTRASEÑA
 */
export const validateResetPassword = [
    body('token')
        .trim()
        .notEmpty()
        .withMessage('El token de reset es obligatorio.'),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('La contraseña es obligatoria.')
        .isLength({ min: 8, max: 255 })
        .withMessage('La contraseña debe tener entre 8 y 255 caracteres.')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una mayúscula.')
        .matches(/[a-z]/)
        .withMessage('La contraseña debe contener al menos una minúscula.')
        .matches(/[0-9]/)
        .withMessage('La contraseña debe contener al menos un número.')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('La contraseña debe contener al menos un carácter especial (!@#$%^&*...).'),

    body('passwordConfirm')
        .trim()
        .notEmpty()
        .withMessage('La confirmación de contraseña es obligatoria.')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden.');
            }
            return true;
        }),
];