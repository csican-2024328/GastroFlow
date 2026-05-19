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

export const createRestaurantAdmin = async () => {
    const transaction = await sequelize.transaction();

    try {
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

        // Verificar si ya existe un RESTAURANT_ADMIN por defecto
        const adminExists = await UserRole.findOne({
            where: { RoleId: restaurantAdminRole.Id },
            include: [
                {
                    model: User,
                    as: 'User',
                    where: { Email: DEFAULT_ADMIN_EMAIL },
                    required: true,
                },
            ],
            transaction,
        });

        if (adminExists) {
            await transaction.rollback();
            console.log('✅ El RESTAURANT_ADMIN por defecto ya existe');
            return;
        }

        const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

        // Crear usuario RESTAURANT_ADMIN
        const admin = await User.create(
            {
                Name: 'Gerente',
                Surname: 'Restaurante',
                Username: DEFAULT_ADMIN_USERNAME,
                Email: DEFAULT_ADMIN_EMAIL,
                Password: hashedPassword,
                Status: true,
            },
            { transaction }
        );

        // Crear perfil de usuario
        await UserProfile.create(
            {
                UserId: admin.Id,
                ProfilePicture: '',
                Phone: '22345679',
            },
            { transaction }
        );

        // Crear registro de email
        await UserEmail.create(
            {
                UserId: admin.Id,
                EmailVerified: true,
                EmailVerificationToken: null,
                EmailVerificationTokenExpiry: null,
            },
            { transaction }
        );

        // Crear registro de reseteo de contraseña
        await UserPasswordReset.create(
            {
                UserId: admin.Id,
                PasswordResetToken: null,
                PasswordResetTokenExpiry: null,
            },
            { transaction }
        );

        // Asignar rol RESTAURANT_ADMIN
        await UserRole.create(
            {
                UserId: admin.Id,
                RoleId: restaurantAdminRole.Id,
            },
            { transaction }
        );

        await transaction.commit();

        console.log('✅ RESTAURANT_ADMIN por defecto creado exitosamente');
        console.log(`   📧 Email: ${DEFAULT_ADMIN_EMAIL}`);
        console.log(`   🔐 Contraseña: ${DEFAULT_ADMIN_PASSWORD}`);
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        console.error('❌ Error creando RESTAURANT_ADMIN:', error);
    }
};
