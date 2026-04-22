import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helper/uuid-generator.js';

export const Role = sequelize.define(
  'Role',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    Name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'name',
      validate: {
        notEmpty: { msg: 'El nombre del rol es obligatorio.' },
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export const User = sequelize.define(
  'User',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    Name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      field: 'name',
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio.' },
        len: {
          args: [2, 25],
          msg: 'El nombre debe tener entre 2 y 25 caracteres.',
        },
        isAlpha: { msg: 'El nombre solo puede contener letras y espacios.' },
        customValidator(value) {
          if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            throw new Error('El nombre contiene caracteres no válidos.');
          }
        },
      },
    },
    Surname: {
      type: DataTypes.STRING(25),
      allowNull: false,
      field: 'surname',
      validate: {
        notEmpty: { msg: 'El apellido es obligatorio.' },
        len: {
          args: [2, 25],
          msg: 'El apellido debe tener entre 2 y 25 caracteres.',
        },
        isAlpha: { msg: 'El apellido solo puede contener letras y espacios.' },
        customValidator(value) {
          if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            throw new Error('El apellido contiene caracteres no válidos.');
          }
        },
      },
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'username',
      validate: {
        notEmpty: { msg: 'El nombre de usuario es obligatorio.' },
        len: {
          args: [3, 50],
          msg: 'El nombre de usuario debe tener entre 3 y 50 caracteres.',
        },
        isAlphanumeric: { msg: 'El nombre de usuario solo puede contener letras, números y guiones bajos.' },
        customValidator(value) {
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            throw new Error('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.');
          }
        },
      },
    },
    Email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      field: 'email',
      validate: {
        notEmpty: { msg: 'El correo electrónico es obligatorio.' },
        isEmail: { msg: 'El correo electrónico no tiene un formato válido.' },
        len: {
          args: [5, 150],
          msg: 'El correo electrónico debe tener entre 5 y 150 caracteres.',
        },
        customValidator(value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error('El formato del correo electrónico no es válido.');
          }
        },
      },
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password',
      validate: {
        notEmpty: { msg: 'La contraseña es obligatoria.' },
        len: {
          args: [8, 255],
          msg: 'La contraseña debe tener entre 8 y 255 caracteres.',
        },
        isStrongPassword(value) {
          if (!value) {
            throw new Error('La contraseña es obligatoria.');
          }
          if (value.length < 8) {
            throw new Error('La contraseña debe tener mínimo 8 caracteres.');
          }
          if (!/[A-Z]/.test(value)) {
            throw new Error('La contraseña debe contener al menos una mayúscula.');
          }
          if (!/[a-z]/.test(value)) {
            throw new Error('La contraseña debe contener al menos una minúscula.');
          }
          if (!/[0-9]/.test(value)) {
            throw new Error('La contraseña debe contener al menos un número.');
          }
          if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
            throw new Error('La contraseña debe contener al menos un carácter especial (!@#$%^&*...).') ;
          }
        },
      },
    },
    Status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'status',
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export const UserProfile = sequelize.define(
  'UserProfile',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    ProfilePicture: {
      type: DataTypes.STRING(512),
      defaultValue: '',
      field: 'profile_picture',
    },
    Phone: {
      type: DataTypes.STRING(8),
      allowNull: false,
      field: 'phone',
      validate: {
        notEmpty: { msg: 'El número de teléfono es obligatorio.' },
        len: {
          args: [8, 8],
          msg: 'El número de teléfono debe tener exactamente 8 dígitos.',
        },
        isNumeric: { msg: 'El teléfono solo debe contener números.' },
        customValidator(value) {
          if (!/^\d{8}$/.test(value)) {
            throw new Error('El número de teléfono debe tener exactamente 8 dígitos numéricos.');
          }
          if (!/^[2-9]/.test(value)) {
            throw new Error('El número de teléfono debe comenzar con dígito entre 2 y 9.');
          }
        },
      },
    },
  },
  {
    tableName: 'user_profiles',
    timestamps: false,
  }
);

export const UserEmail = sequelize.define(
  'UserEmail',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    EmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'email_verified',
    },
    EmailVerificationToken: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'email_verification_token',
    },
    EmailVerificationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verification_token_expiry',
    },
  },
  {
    tableName: 'user_emails',
    timestamps: false,
  }
);

export const UserPasswordReset = sequelize.define(
  'UserPasswordReset',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    PasswordResetToken: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'password_reset_token',
    },
    PasswordResetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_token_expiry',
    },
  },
  {
    tableName: 'user_password_resets',
    timestamps: false,
  }
);

export const UserRole = sequelize.define(
  'UserRole',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    RoleId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'role_id',
      references: {
        model: Role,
        key: 'id',
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'user_roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Associations
Role.hasMany(UserRole, { foreignKey: 'role_id', as: 'UserRoles' });
UserRole.belongsTo(Role, { foreignKey: 'role_id', as: 'Role' });

User.hasMany(UserRole, { foreignKey: 'user_id', as: 'UserRoles' });
UserRole.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'UserProfile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(UserEmail, { foreignKey: 'user_id', as: 'UserEmail' });
UserEmail.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(UserPasswordReset, {
  foreignKey: 'user_id',
  as: 'UserPasswordReset',
});
UserPasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'User' });