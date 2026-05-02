'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/User/user.route.js';
import staffRoutes from '../src/Staff/staff.routes.js';
import { errorMiddleware } from '../middlewares/error.middleware.js';
import { initializeEmailService, verificarConexionSMTP } from '../helper/email-service.js';
import { createPlatformAdmin } from '../helper/createPlatformAdmin.js';
import { setupSwagger } from './swagger.js';

const BASE_PATH = '/api/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/users`, userRoutes);
  app.use(`${BASE_PATH}/staff`, staffRoutes);


  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'GastroFlow PostgreSQL Service',
    });
  });
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT;
  app.set('trust proxy', 1);

  try {
    // Inicializar servicio de Email
    console.log('\n📧 Inicializando servicio de email...');
    initializeEmailService();
    const smtpConnectionOk = await verificarConexionSMTP();
    if (!smtpConnectionOk) {
      console.log('⚠️  ADVERTENCIA: El servicio de email no está disponible.');
      console.log('   Todos los usuarios registrados verán el email como no verificado.');
      console.log('   Asegúrate de configurar las variables de entorno SMTP correctamente.\n');
    }

    // Conectar PostgreSQL (usuarios, auth)
    await dbConnection();
    await createPlatformAdmin();

    middlewares(app);
    routes(app);

    // Swagger UI disponible en /swagger
    setupSwagger(app);

    app.use(notFound);
    app.use(errorMiddleware);

    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      console.log(`\n✅ GastroFlow API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
  } catch (error) {
    console.error(`\n❌ Error starting server:`, error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};