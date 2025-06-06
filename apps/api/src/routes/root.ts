import fastify from 'fastify';

export default async function (server: ReturnType<typeof fastify>) {
  server.get('/', async function () {
    return { message: 'Hello API' };
  });
}
