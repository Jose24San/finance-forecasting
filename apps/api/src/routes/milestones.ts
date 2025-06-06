import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const milestones = async (server: ReturnType<typeof fastify>) => {
  // Create a new milestone
  server.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, type, date, impact, scenarioId } =
      request.body as Prisma.MilestoneUncheckedCreateInput;

    try {
      const milestone = await prisma.milestone.create({
        data: {
          name,
          type,
          date: new Date(date),
          impact,
          scenarioId,
        },
      });
      return milestone;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to create milestone' });
      return;
    }
  });

  // Get milestones for a scenario
  server.get(
    '/scenario/:scenarioId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { scenarioId } = request.params as { scenarioId: string };

      try {
        const milestones = await prisma.milestone.findMany({
          where: { scenarioId },
        });
        return milestones;
      } catch (error) {
        server.log.error(error);
        reply.status(500).send({ error: 'Failed to fetch milestones' });
        return;
      }
    }
  );

  // Update a milestone
  server.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Prisma.MilestoneUncheckedUpdateInput;

    try {
      const milestone = await prisma.milestone.update({
        where: { id },
        data: {
          ...updates,
          date:
            typeof updates.date === 'string'
              ? new Date(updates.date)
              : updates.date,
        },
      });
      return milestone;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to update milestone' });
      return;
    }
  });

  // Delete a milestone
  server.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        await prisma.milestone.delete({
          where: { id },
        });
        reply.status(204).send();
      } catch (error) {
        server.log.error(error);
        reply.status(500).send({ error: 'Failed to delete milestone' });
      }
    }
  );
};

export default milestones;
