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

const RESTAURANT_ADMIN_ROLE = 'RESTAURANT_ADMIN';
const DEFAULT_ADMIN_USERNAME = 'restaurant_admin';
const DEFAULT_ADMIN_EMAIL = 'restaurant_admin@gastroflow.local';
const DEFAULT_ADMIN_PASSWORD = 'RestaurantAdmin@1234!';

const seedBaseRoles = async (transaction) => {
    await Role.findOrCreate({
        where: { Name: RESTAURANT_ADMIN_ROLE },
        defaults: { Name: RESTAURANT_ADMIN_ROLE },
        transaction,
    });
};

export const createRestaurantAdmin = async () => {
    const transaction = await sequelize.transaction();

    try {
        await seedBaseRoles(transaction);

        // Verificar que el rol RESTAURANT_ADMIN existe
        const restaurantAdminRole = await Role.findOne({
            where: { Name: RESTAURANT_ADMIN_ROLE },
            transaction,
        });

        if (!restaurantAdminRole) {
            await transaction.rollback();
            console.log('⚠️  El rol RESTAURANT_ADMIN no existe en la base de datos');
            return;
        }

        const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

        // Buscar o crear el usuario por email para que el seed sea idempotente
        const [admin, created] = await User.findOrCreate({
            where: { Email: DEFAULT_ADMIN_EMAIL },
            defaults: {
                Name: 'Gerente',
                Surname: 'Restaurante',
                Username: DEFAULT_ADMIN_USERNAME,
                Email: DEFAULT_ADMIN_EMAIL,
                Password: hashedPassword,
                Status: true,
            },
            transaction,
        });

        if (!created) {
            await admin.update(
                {
                    Name: 'Gerente',
                    Surname: 'Restaurante',
                    Username: DEFAULT_ADMIN_USERNAME,
                    Password: hashedPassword,
                    Status: true,
                },
                { transaction }
            );
        }

        // Verificar si ya existe un rol asignado al usuario y limpiarlo para evitar redirecciones erróneas
        await UserRole.destroy({
            where: { UserId: admin.Id },
            transaction,
        });

        const existingProfile = await UserProfile.findOne({
            where: { UserId: admin.Id },
            transaction,
        });

        if (existingProfile) {
            await existingProfile.update(
                {
                    ProfilePicture: '',
                    Phone: existingProfile.Phone || '22345679',
                },
                { transaction }
            );
        } else {
            await UserProfile.create(
                {
                    UserId: admin.Id,
                    ProfilePicture: '',
                    Phone: '22345679',
                },
                { transaction }
            );
        }

        const existingEmail = await UserEmail.findOne({
            where: { UserId: admin.Id },
            transaction,
        });

        if (existingEmail) {
            await existingEmail.update(
                {
                    EmailVerified: true,
                    EmailVerificationToken: null,
                    EmailVerificationTokenExpiry: null,
                },
                { transaction }
            );
        } else {
            await UserEmail.create(
                {
                    UserId: admin.Id,
                    EmailVerified: true,
                    EmailVerificationToken: null,
                    EmailVerificationTokenExpiry: null,
                },
                { transaction }
            );
        }

        const existingReset = await UserPasswordReset.findOne({
            where: { UserId: admin.Id },
            transaction,
        });

        if (existingReset) {
            await existingReset.update(
                {
                    PasswordResetToken: null,
                    PasswordResetTokenExpiry: null,
                },
                { transaction }
            );
        } else {
            await UserPasswordReset.create(
                {
                    UserId: admin.Id,
                    PasswordResetToken: null,
                    PasswordResetTokenExpiry: null,
                },
                { transaction }
            );
        }

        // Asignar rol RESTAURANT_ADMIN
        await UserRole.create(
            {
                UserId: admin.Id,
                RoleId: restaurantAdminRole.Id,
            },
            { transaction }
        );

        await transaction.commit();

        console.log(`✅ RESTAURANT_ADMIN ${created ? 'creado' : 'actualizado'} exitosamente`);
        console.log(`   📧 Email: ${DEFAULT_ADMIN_EMAIL}`);
        console.log(`   🔐 Contraseña: ${DEFAULT_ADMIN_PASSWORD}`);
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        console.error('❌ Error creando RESTAURANT_ADMIN:', error);
    }
};
