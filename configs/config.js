import dotenv from 'dotenv';

dotenv.config();

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'MyVerySecretKeyForJWTTokenAuthenticationWith256Bits!',
    expiresIn: process.env.JWT_EXPIRES_IN || '30m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'GastroFlow',
    audience: process.env.JWT_AUDIENCE || 'GastroFlow',
  },
  upload: {
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@gastroflow.com',
    fromName: process.env.EMAIL_FROM_NAME || 'GastroFlow',
  },
  verification: {
    emailExpiryHours: parseInt(process.env.VERIFICATION_EMAIL_EXPIRY_HOURS || '24'),
    passwordResetExpiryHours: parseInt(process.env.PASSWORD_RESET_EXPIRY_HOURS || '1'),
  },
};
