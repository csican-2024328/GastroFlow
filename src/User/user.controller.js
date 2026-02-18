import { asyncHandler } from '../../middlewares/validate-JWT.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { findUserById, updateUserProfile } from '../../helper/user-db.js';
import { buildUserResponse } from '../../helper/user-helpers.js';

// Controlador para obtener el perfil del usuario actual autenticado
export const getProfile = [
  validateJWT,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.userId;

      // Obtener los datos del perfil del usuario desde la base de datos
      const userProfile = await findUserById(userId);

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: buildUserResponse(userProfile),
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error al obtener perfil',
      });
    }
  }),
];

// Controlador para actualizar el perfil del usuario actual autenticado
export const updateProfile = [
  validateJWT,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.userId;
      const updateData = req.body;

      // Llamar al helper que actualiza el perfil con validaciones
      const updatedProfile = await updateUserProfile(userId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: buildUserResponse(updatedProfile),
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);

      // Asignar código de estado apropiado según el tipo de error
      let statusCode = 400;
      if (error.message.includes('no encontrado')) {
        statusCode = 404; // Usuario no encontrado
      } else if (error.message.includes('ya está en uso')) {
        statusCode = 409; // Nombre de usuario ya existe
      }

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar perfil',
      });
    }
  }),
];
