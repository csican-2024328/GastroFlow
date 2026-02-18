import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helper/uuid-generator.js';

export const Restaurant = sequelize.define(
  'Restaurant',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name',
      validate: {
        notEmpty: { msg: 'El nombre del restaurante es obligatorio.' },
      },
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'email',
      validate: {
        isEmail: { msg: 'El email debe ser válido.' },
      },
    },
    Phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'phone',
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'address',
    },
    City: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'city',
    },
    OpeningHours: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'opening_hours',
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
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
    tableName: 'restaurants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);