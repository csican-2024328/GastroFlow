import express from 'express';
import { dbConnection } from './db.js';

export const initServer = async () => {
    const app = express();
    const PORT = parseInt(process.env.PORT, 10) || 3006;

    app.use(express.json());

    try {
        // Connect to DB (non-blocking for server start)
        dbConnection().catch(err => console.error('DB connection error:', err));

        app.listen(PORT, () => {
            console.log(`GastroFlow Admin server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
}