import express from 'express';
import cors from 'cors';
import { dbConnection } from './db.js';
import { createPlatformAdmin } from '../helper/createPlatformAdmin.js';
import authRoutes from '../src/User/auth.routes.js';

export const initServer = async () => {
    const app = express();
    const PORT = parseInt(process.env.PORT, 10) || 3006;
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3006')
        .split(',')
        .map(origin => origin.trim());

    app.use(cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/auth', authRoutes);

    try {
        await dbConnection();

        console.log('Base de datos conectada');

        await createPlatformAdmin();

        app.listen(PORT, () => {
            console.log(`GastroFlow Admin server running on port ${PORT}`);
            console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
        });

    } catch (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
};