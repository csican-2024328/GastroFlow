import { buildUserResponse } from '../utils/user-helpers.js';

// Note: Esta función es para el servicio PostgreSQL
// En el servicio MongoDB, los perfiles de usuarios deben ser obtenidos del servicio de autenticación
export const getUserProfileHelper = async (userId) => {
  const err = new Error('Función no disponible en MongoDB service. Use PostgreSQL service.');
  err.status = 501;
  throw err;
};
