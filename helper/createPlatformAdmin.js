import User from '../src/User/User.model.js';

export const createPlatformAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'PLATFORM_ADMIN' });

        if (adminExists) {
            console.log('ℹEl PLATFORM_ADMIN ya existe');
            return;
        }

        const adminData = {
            name: 'Administrador',
            surname: 'Admin',
            email: 'admin@gastroflow.com',
            password: 'Admin123',
            phone: '12345678',
            address: 'Guatemala',
            role: 'PLATFORM_ADMIN',
            status: 'ACTIVO',
            emailVerified: true
        };

        const admin = new User(adminData);
        await admin.save();

        console.log('PLATFORM_ADMIN creado automáticamente');
    } catch (error) {
        console.error('Error creando PLATFORM_ADMIN:', error);
    }
};