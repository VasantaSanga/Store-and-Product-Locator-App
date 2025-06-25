import express, { Express, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const app: Express = express();
const port = process.env.PORT || 3001; // Fallback port if not defined in .env

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
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
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Export prisma client for use in other modules (routes)
export { prisma };
