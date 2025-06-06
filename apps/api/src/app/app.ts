import * as path from 'path';
import fastify from 'fastify';
import AutoLoad from '@fastify/autoload';
import assets from '../routes/assets';
import milestones from '../routes/milestones';
import scenarios from '../routes/scenarios';
import incomeStreams from '../routes/income-streams';
import forecast from '../routes/forecast';
import root from '../routes/root';

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(
  server: ReturnType<typeof fastify>,
  opts: AppOptions
) {
  // Place here your custom code!

  // Register root route
  await server.register(root);

  // Register API routes directly
  await server.register(assets, { prefix: '/assets' });
  await server.register(milestones, { prefix: '/milestones' });
  await server.register(scenarios, { prefix: '/scenarios' });
  await server.register(incomeStreams, { prefix: '/income-streams' });
  await server.register(forecast, { prefix: '/forecast' });

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  server.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });
}

export async function build() {
  const server = fastify();
  await app(server, {});
  return server;
}
