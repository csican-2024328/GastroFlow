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

export const createPlatformAdmin = async () => {
    const transaction = await sequelize.transaction();

    try {
        const adminExists = await User.findOne({
            include: [
                {
                    model: UserRole,
                    as: 'UserRoles',
                    required: true,
                    include: [
                        {
                            model: Role,
                            as: 'Role',
                            required: true,
                            where: { Name: 'PLATFORM_ADMIN' },
                        },
                    ],
                },
            ],
            transaction,
        });

        if (adminExists) {
            await transaction.rollback();
            console.log('El PLATFORM_ADMIN ya existe');
            return;
        }

        const adminRole = await Role.findOne({
            where: { Name: 'PLATFORM_ADMIN' },
            transaction,
        });

        if (!adminRole) {
            throw new Error('No existe el rol PLATFORM_ADMIN en la base de datos');
        }

        const hashedPassword = await hashPassword('Admin@1234!');

        const admin = await User.create(
            {
                Name: 'Administrador',
                Surname: 'Admin',
                Username: 'platform.admin',
                Email: 'admin@gastroflow.com',
                Password: hashedPassword,
                Status: true,
            },
            { transaction }
        );

        await UserProfile.create(
            {
                UserId: admin.Id,
                ProfilePicture: '',
                Phone: '12345678',
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