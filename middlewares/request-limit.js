import rateLimit from 'express-rate-limit';

export const requestLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: 'Demasiados intentos de autenticación, intenta más tarde.',
  skipSuccessfulRequests: true,
});
