'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { connectMongoDB } from './mongodb.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import {
  errorHandler,
  notFound,
} from '../middlewares/server-genericError-handler.js';
import authRoutes from '../src/auth/auth.routes.js';
import restaurantRoutes from '../src/Restaurant/Restaurant.routes.js';
import mesaRoutes from '../src/Mesas/mesa.routes.js';
import platosRoutes from '../src/Platos/platos.routes.js';
import reportsRoutes from '../src/Reports/reports.routes.js';
import inventoryRoutes from '../src/Inventory/inventory.routes.js';
import orderRoutes from '../src/Order/order.routes.js';
import eventRoutes from '../src/Event/event.routes.js';
import couponRoutes from '../src/Coupon/coupon.routes.js';
import { errorMiddleware } from '../middlewares/error.middleware.js';

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
  app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);
  app.use(`${BASE_PATH}/mesas`, mesaRoutes);
  app.use(`${BASE_PATH}/platos`, platosRoutes);
  app.use(`${BASE_PATH}/reports`, reportsRoutes);
  app.use(`${BASE_PATH}/inventory`, inventoryRoutes);
  app.use(`${BASE_PATH}/orders`, orderRoutes);
  app.use(`${BASE_PATH}/events`, eventRoutes);
  app.use(`${BASE_PATH}/coupons`, couponRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'GastroFlow',
    });
  });
  app.use(notFound);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT;
  app.set('trust proxy', 1);

  try {
    // Conectar PostgreSQL (usuarios, auth)
    await dbConnection();

    // Conectar MongoDB (restaurantes, mesas, platos)
    await connectMongoDB();

    const { seedInitialData } = await import('../seeders/dataSeeder.js');
    await seedInitialData();

    middlewares(app);
    routes(app);
    app.use(errorMiddleware);

    app.use(errorHandler);

    const server = app.listen(PORT, () => {
      console.log(`GastroFlow API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
  } catch (error) {
    console.error(`Error starting server:`, error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};