import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const scenarios = async (server: ReturnType<typeof fastify>) => {
  // Create a new scenario
  server.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, description, userId } =
      request.body as Prisma.ScenarioUncheckedCreateInput;

    try {
      const scenario = await prisma.scenario.create({
        data: {
          name,
          description,
          userId,
        },
      });
      return scenario;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to create scenario' });
      return;
    }
  });

  // Get a scenario by ID with all relations
  server.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const scenario = await prisma.scenario.findUnique({
        where: { id },
        include: {
          assets: true,
          incomeStreams: true,
          milestones: true,
          settings: true,
          withdrawalOrder: true,
        },
      });

      if (!scenario) {
        reply.status(404).send({ error: 'Scenario not found' });
        return;
      }

      return scenario;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch scenario' });
      return;
    }
  });

  // Update a scenario
  server.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Prisma.ScenarioUncheckedUpdateInput;

    try {
      const scenario = await prisma.scenario.update({
        where: { id },
        data: updates,
      });
      return scenario;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to update scenario' });
      return;
    }
  });

  // Delete a scenario
  server.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        await prisma.scenario.delete({
          where: { id },
        });
        reply.status(204).send();
      } catch (error) {
        server.log.error(error);
        reply.status(500).send({ error: 'Failed to delete scenario' });
      }
    }
  );
};

export default scenarios;
