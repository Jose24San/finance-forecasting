import { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient();

// Fastify server options
const serverOptions: FastifyServerOptions = {
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    },
  },
};

// Create Fastify instance
const server: FastifyInstance = fastify(serverOptions);

// Register plugins
async function registerPlugins() {
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  });
}

// Register routes
async function registerRoutes() {
  // Health check route
  server.get('/health', async () => {
    return { status: 'ok' };
  });

  // Register route modules
  server.register(import('./routes/scenarios'), { prefix: '/api/scenarios' });
  server.register(import('./routes/assets'), { prefix: '/api/assets' });
  server.register(import('./routes/income-streams'), {
    prefix: '/api/income-streams',
  });
  server.register(import('./routes/milestones'), { prefix: '/api/milestones' });
  server.register(import('./routes/forecast'), { prefix: '/api/forecast' });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });

    console.log(`Server is running on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
start();
