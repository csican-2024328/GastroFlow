import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helper/uuid-generator.js';

export const Staff = sequelize.define(
  'Staff',
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
      field: 'name',
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio.' },
      },
    },
    Surname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'surname',
      validate: {
        notEmpty: { msg: 'El apellido es obligatorio.' },
      },
    },
    RestaurantId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'restaurant_id',
    },
    Role: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'role',
      validate: {
        notEmpty: { msg: 'El rol es obligatorio.' },
      },
    },
    Status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'staff',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
