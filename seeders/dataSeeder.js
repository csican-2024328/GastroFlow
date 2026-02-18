import { sequelize } from '../configs/db.js';
import {
  User,
  UserProfile,
  UserEmail,
  UserPasswordReset,
  Role,
  UserRole,
} from '../src/User/User.model.js';
import { hashPassword } from '../utils/password-utils.js';

const ADMIN_ROLE_NAME = 'ADMIN_ROLE';
const USER_ROLE_NAME = 'USER_ROLE';

const createDefaultRoles = async (transaction) => {
  const existingAdminRole = await Role.findOne({
    where: { Name: ADMIN_ROLE_NAME },
    transaction,
  });

  if (!existingAdminRole) {
    await Role.create(
      {
        Name: ADMIN_ROLE_NAME,
      },
      { transaction }
    );
  }

  const existingUserRole = await Role.findOne({
    where: { Name: USER_ROLE_NAME },
    transaction,
  });

  if (!existingUserRole) {
    await Role.create(
      {
        Name: USER_ROLE_NAME,
      },
      { transaction }
    );
  }
};

const createDefaultAdmin = async () => {
  const usersCount = await User.count();
  if (usersCount > 0) {
    console.log('Seed | Users already exist, skipping admin creation.');
    return;
  }

  const transaction = await sequelize.transaction();
  try {
    // Crear roles por defecto
    await createDefaultRoles(transaction);

    const hashedPassword = await hashPassword('Admin@1234!');

    const adminUser = await User.create(
      {
        Name: 'Admin',
        Surname: 'User',
        Username: 'admin',
        Email: 'admin@gastroflow.local',
        Password: hashedPassword,
        Status: true,
      },
      { transaction }
    );

    // Obtener el rol ADMIN_ROLE
    const adminRole = await Role.findOne(
      {
        where: { Name: ADMIN_ROLE_NAME },
      },
      { transaction }
    );

    // Asignar rol al usuario
    if (adminRole) {
      await UserRole.create(
        {
          UserId: adminUser.Id,
          RoleId: adminRole.Id,
        },
        { transaction }
      );
    }

    await UserProfile.create(
      {
        UserId: adminUser.Id,
        ProfilePicture: '',
        Phone: '00000000',
      },
      { transaction }
    );

    await UserEmail.create(
      {
        UserId: adminUser.Id,
        EmailVerified: true,
        EmailVerificationToken: null,
        EmailVerificationTokenExpiry: null,
      },
      { transaction }
    );

    await UserPasswordReset.create(
      {
        UserId: adminUser.Id,
        PasswordResetToken: null,
        PasswordResetTokenExpiry: null,
      },
      { transaction }
    );

    await transaction.commit();
    console.log('Seed | Default admin user created.');
    console.log('Seed | Admin credentials:');
    console.log('  Username: admin');
    console.log('  Email: admin@gastroflow.local');
    console.log('  Password: Admin@1234!');
  } catch (error) {
    await transaction.rollback();
    console.error('Seed | Failed to create admin user:', error.message);
    throw error;
  }
};

export const seedInitialData = async () => {
  try {
    await createDefaultAdmin();
  } catch (error) {
    console.error('Seed | Error seeding initial data:', error.message);
    throw error;
  }
};
