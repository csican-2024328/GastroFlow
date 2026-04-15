import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
  findUserById,
  updateUserProfile,
  softDeleteUser,
} from '../../helper/user-db.js';
import { buildUserResponse } from '../../utils/user-helpers.js';
import { Role, User, UserEmail, UserProfile, UserRole } from './User.model.js';
import { assignRoleHelper } from '../../helper/auth-operations.js';

const buildRoleResponse = (role) => ({
  id: role.Id,
  name: role.Name,
  createdAt: role.CreatedAt,
  updatedAt: role.UpdatedAt,
});

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return null;
};

export const getProfile = [
  validateJWT,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.userId;
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

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['Password'] },
    include: [
      { model: UserProfile, as: 'UserProfile' },
      { model: UserEmail, as: 'UserEmail' },
      {
        model: UserRole,
        as: 'UserRoles',
        include: [{ model: Role, as: 'Role' }],
      },
    ],
    order: [['CreatedAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Usuarios obtenidos exitosamente',
    data: users.map((user) => buildUserResponse(user)),
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await findUserById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Usuario obtenido exitosamente',
    data: buildUserResponse(user),
  });
});

export const getRolesCatalog = asyncHandler(async (req, res) => {
  const roles = await Role.findAll({
    order: [['Name', 'ASC']],
  });

  return res.status(200).json({
    success: true,
    message: 'Catalogo de roles obtenido exitosamente',
    data: roles.map((role) => buildRoleResponse(role)),
  });
});

export const changeUserRole = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName } = req.body;
    const requestingUserId = req.usuario?.sub || req.usuario?.userId || req.usuario?.id;

    if (!requestingUserId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const result = await assignRoleHelper(requestingUserId, id, roleName);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.user,
    });
  } catch (error) {
    let statusCode = error.status || 400;

    if (error.message.includes('no encontrado') || error.message.includes('no existe')) {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al actualizar rol',
    });
  }
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const nextStatus = parseBoolean(req.body.status);

  if (nextStatus === null) {
    return res.status(400).json({
      success: false,
      message: 'El campo status debe ser booleano',
    });
  }

  const user = await User.findByPk(id, {
    include: [
      { model: UserProfile, as: 'UserProfile' },
      { model: UserEmail, as: 'UserEmail' },
      {
        model: UserRole,
        as: 'UserRoles',
        include: [{ model: Role, as: 'Role' }],
      },
    ],
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado',
    });
  }

  await user.update({ Status: nextStatus });

  return res.status(200).json({
    success: true,
    message: nextStatus ? 'Usuario reactivado exitosamente' : 'Usuario congelado exitosamente',
    data: buildUserResponse(user),
  });
});

export const deleteProfile = [
  validateJWT,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.userId;
      const { motivo, confirmacion } = req.body;

      if (!confirmacion || confirmacion !== true) {
        return res.status(400).json({
          success: false,
          message: 'Confirmación requerida para eliminar el usuario',
        });
      }

      if (motivo && motivo.length > 200) {
        return res.status(400).json({
          success: false,
          message: 'El motivo no puede exceder 200 caracteres',
        });
      }

      const user = await findUserById(userId);
      if (user && user.UserRoles && user.UserRoles[0] && user.UserRoles[0].Role && user.UserRoles[0].Role.Name === 'PLATFORM_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'No se permite eliminar usuarios con rol PLATFORM_ADMIN',
        });
      }

      const deletedUser = await softDeleteUser(userId);
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado o ya eliminado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado lógicamente',
        motivo: motivo || null,
      });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar usuario',
      });
    }
  }),
];

export const updateProfile = [
  validateJWT,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.userId;
      const updateData = req.body;

      const updatedProfile = await updateUserProfile(userId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: buildUserResponse(updatedProfile),
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);

      let statusCode = 400;
      if (error.message.includes('no encontrado')) {
        statusCode = 404;
      } else if (error.message.includes('ya está en uso')) {
        statusCode = 409;
      }

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar perfil',
      });
    }
  }),
];

export const assignRole = asyncHandler(async (req, res) => {
  try {
    const { targetUserId, roleName } = req.body;
    const requestingUserId = req.usuario?.sub || req.usuario?.userId;

    if (!requestingUserId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const result = await assignRoleHelper(requestingUserId, targetUserId, roleName);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.user,
    });
  } catch (error) {
    console.error('Error en assignRole controller:', error);

    let statusCode = 400;
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('ya posee') || error.message.includes('no permitido')) {
      statusCode = 409;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al asignar rol',
    });
  }
});
