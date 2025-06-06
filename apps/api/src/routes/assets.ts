import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const assets = async (server: ReturnType<typeof fastify>) => {
  // Create a new asset
  server.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, amount, category, growthRate, scenarioId } =
      request.body as Prisma.AssetUncheckedCreateInput;

    try {
      const asset = await prisma.asset.create({
        data: {
          name,
          amount,
          category, // Prisma will validate the enum at runtime
          growthRate: growthRate || 7.0,
          scenarioId,
        },
      });
      return asset;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to create asset' });
      return;
    }
  });

  // Get assets for a scenario
  server.get(
    '/scenario/:scenarioId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { scenarioId } = request.params as { scenarioId: string };

      try {
        const assets = await prisma.asset.findMany({
          where: { scenarioId },
        });
        return assets;
      } catch (error) {
        server.log.error(error);
        reply.status(500).send({ error: 'Failed to fetch assets' });
        return;
      }
    }
  );

  // Update an asset
  server.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Prisma.AssetUncheckedUpdateInput;

    try {
      const asset = await prisma.asset.update({
        where: { id },
        data: updates,
      });
      return asset;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to update asset' });
      return;
    }
  });

  // Delete an asset
  server.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        await prisma.asset.delete({
          where: { id },
        });
        reply.status(204).send();
      } catch (error) {
        server.log.error(error);
        reply.status(500).send({ error: 'Failed to delete asset' });
      }
    }
  );
};

export default assets;
