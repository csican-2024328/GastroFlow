import dotenv from 'dotenv';
import { initServer } from './configs/app.js';
import { initializeEmailService, verificarConexionSMTP } from './helper/email.service.js';

dotenv.config();

initializeEmailService();


verificarConexionSMTP().catch(err => {
    console.warn('⚠️  SMTP check falló:', err.message);
});

initServer();