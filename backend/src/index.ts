import { config } from 'dotenv';

// load env config
config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

export const Environments = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

// Configuration object
const configs = {
  NODE_ENV: process.env.NODE_ENV ?? Environments.DEVELOPMENT,
  PORT: parseInt(process.env.PORT || '3001', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || ''
};

const app: Express = express();

// Initialize Prisma Client AFTER dotenv is loaded
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: configs.CORS_ORIGIN, // Use config instead of hardcoded value
  credentials: true
}));
app.use(express.json()); // Parses incoming requests with JSON payloads

// Basic Error Handling Middleware (example)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('Store Locator Backend is running!');
});

// Import routes
import storeRoutes from './routes/storeRoutes';
import filterRoutes from './routes/filterRoutes';

// Use routes
app.use('/api/stores', storeRoutes); // All routes in storeRoutes will be prefixed with /api/stores
app.use('/api/filters', filterRoutes); // All routes in filterRoutes will be prefixed with /api/filters

// Graceful shutdown for Prisma Client
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(configs.PORT, () => {
  console.log(`Server is running on http://localhost:${configs.PORT}`);
});
// Export prisma client for use in other modules (routes)
export { prisma };

