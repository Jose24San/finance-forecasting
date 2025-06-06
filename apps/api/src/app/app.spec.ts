import fastify from 'fastify';
import { app } from './app';

describe('GET /', () => {
  let server: ReturnType<typeof fastify>;

  beforeEach(() => {
    server = fastify();
    server.register(app);
  });

  it('should respond with a message', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.json()).toEqual({ message: 'Hello API' });
  });
});
