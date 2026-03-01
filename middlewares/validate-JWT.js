import { verifyJWT } from '../helper/generate-jwt.js';
import { findUserById } from '../helper/user-db.js';

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
