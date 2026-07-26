import mongoose from 'mongoose';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import authRoutes from './routes/authRoutes';
import studyPlanRoutes from './routes/studyPlanRoutes';
import taskRoutes from './routes/taskRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import errorHandler from './middleware/errorHandler';
import sanitizeRequest from './middleware/sanitizeMiddleware';
import requestLogger from './middleware/requestLogger';

const app = express();

app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 0);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api/', limiter);

app.use(requestLogger);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(sanitizeRequest);

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Study Planner API',
      version: '1.0.0',
      description: 'Backend API for AI-Powered Personalized Study Planner',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/ready', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const ready = dbState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not-ready',
    dependencies: { database: ready ? 'up' : 'down' },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
