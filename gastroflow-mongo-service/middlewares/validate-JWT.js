import { verifyJWT } from '../helper/generate-jwt.js';
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

    // En MongoDB service, confiamos en el JWT decodificado
    // La validación del usuario se realiza en el PostgreSQL service
    req.usuario = {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      phone: decoded.phone
    };
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
