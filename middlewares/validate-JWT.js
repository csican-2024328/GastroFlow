import { verifyJWT } from '../helper/generate-jwt.js';
import { findUserById } from '../helper/user-db.js';
import { isTokenJtiRevoked } from '../helper/session-token-store.js';

export const validateJWT = async (req, res, next) => {
  try {
    let token =
      req.header('x-token') ||
      req.header('authorization') ||
      req.body.token ||
      req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token en la petición',
      });
    }

    token = token.replace(/^Bearer\s+/, '');

    const decoded = await verifyJWT(token);

    if (isTokenJtiRevoked(decoded.jti)) {
      return res.status(401).json({
        success: false,
        message: 'Token revocado. Inicia sesion nuevamente.',
      });
    }

    const user = await findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - Usuario no existe',
      });
    }

    if (!user.Status) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    req.user = user;
    req.userId = user.Id.toString();
    req.jwtPayload = decoded;
    req.token = token;

    next();
  } catch (err) {
    console.error('Error validating JWT:', err);

    return res.status(401).json({
      success: false,
      message: 'Token no válido',
      error: err.message,
    });
  }
};
