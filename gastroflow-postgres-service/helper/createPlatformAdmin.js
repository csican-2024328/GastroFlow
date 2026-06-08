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

const PLATFORM_ADMIN_ROLE = 'PLATFORM_ADMIN';
const DEFAULT_ROLES = [PLATFORM_ADMIN_ROLE, 'RESTAURANT_ADMIN', 'CLIENT'];
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_EMAIL = 'admin@gastroflow.local';
const DEFAULT_ADMIN_PASSWORD = 'Admin@1234!';

const seedBaseRoles = async (transaction) => {
    for (const roleName of DEFAULT_ROLES) {
        await Role.findOrCreate({
            where: { Name: roleName },
            defaults: { Name: roleName },
            transaction,
        });
    }
};

export const createPlatformAdmin = async () => {
    const transaction = await sequelize.transaction();

    try {
        await seedBaseRoles(transaction);

        const adminRole = await Role.findOne({
            where: { Name: PLATFORM_ADMIN_ROLE },
            transaction,
        });

        if (!adminRole) {
            throw new Error('No existe el rol PLATFORM_ADMIN en la base de datos');
        }

        const adminExists = await UserRole.findOne({
            where: { RoleId: adminRole.Id },
            include: [
                {
                    model: User,
                    as: 'User',
                    required: true,
                },
            ],
            transaction,
        });

        if (adminExists) {
            await transaction.rollback();
            console.log('El PLATFORM_ADMIN ya existe');
            return;
        }

        const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

        const admin = await User.create(
            {
                Name: 'Administrador',
                Surname: 'Admin',
                Username: DEFAULT_ADMIN_USERNAME,
                Email: DEFAULT_ADMIN_EMAIL,
                Password: hashedPassword,
                Status: true,
            },
            { transaction }
        );

        await UserProfile.create(
            {
                UserId: admin.Id,
                ProfilePicture: '',
                Phone: '22345678',
            },
            { transaction }
        );

        await UserEmail.create(
            {
                UserId: admin.Id,
                EmailVerified: true,
                EmailVerificationToken: null,
                EmailVerificationTokenExpiry: null,
            },
            { transaction }
        );

        await UserPasswordReset.create(
            {
                UserId: admin.Id,
                PasswordResetToken: null,
                PasswordResetTokenExpiry: null,
            },
            { transaction }
        );

        await UserRole.create(
            {
                UserId: admin.Id,
                RoleId: adminRole.Id,
            },
            { transaction }
        );

        await transaction.commit();

        console.log('PLATFORM_ADMIN creado automáticamente');
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        console.error('Error creando PLATFORM_ADMIN:', error);
    }
};