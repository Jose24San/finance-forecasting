import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const incomeStreams = async (server: ReturnType<typeof fastify>) => {
  // Create a new income stream
  server.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const {
      name,
      amount,
      frequency,
      startDate,
      endDate,
      raiseRate,
      scenarioId,
    } = request.body as Prisma.IncomeStreamUncheckedCreateInput;

    try {
      const incomeStream = await prisma.incomeStream.create({
        data: {
          name,
          amount,
          frequency,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          raiseRate,
          scenarioId,
        },
      });
      return incomeStream;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to create income stream' });
      return;
    }
  });

  // Get income streams for a scenario
  server.get(
    '/scenario/:scenarioId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { scenarioId } = request.params as { scenarioId: string };

      try {
        const incomeStreams = await prisma.incomeStream.findMany({
          where: { scenarioId },
        });
        return incomeStreams;
      } catch (error) {
        server.log.error(error);
        reply.status(500).send({ error: 'Failed to fetch income streams' });
        return;
      }
    }
  );

  // Update an income stream
  server.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Prisma.IncomeStreamUncheckedUpdateInput;

    try {
      const incomeStream = await prisma.incomeStream.update({
        where: { id },
        data: {
          ...updates,
          startDate: updates.startDate
            ? new Date(updates.startDate as string)
            : undefined,
          endDate: updates.endDate
            ? new Date(updates.endDate as string)
            : undefined,
        },
      });
      return incomeStream;
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Failed to update income stream' });
      return;
    }
  });

  // Delete an income stream
  server.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        await prisma.incomeStream.delete({
          where: { id },
        });
        reply.status(204).send();
      } catch (error) {
        server.log.error(error);
        reply.status(500).send({ error: 'Failed to delete income stream' });
      }
    }
  );
};

export default incomeStreams;
