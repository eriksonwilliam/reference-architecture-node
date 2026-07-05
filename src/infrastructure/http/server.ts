import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';
import { errorHandler } from './error-handler';
import { registerTaskRoutes, type TaskUseCases } from './routes/task-routes';

export interface BuildServerOptions {
  logger?: FastifyServerOptions['logger'];
}

/**
 * Adapter de entrada (driving adapter). Monta a aplicacao Fastify,
 * registra o handler de erros, a rota de health check e as rotas de dominio.
 */
export function buildServer(
  useCases: TaskUseCases,
  options: BuildServerOptions = {},
): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });

  app.setErrorHandler(errorHandler);
  app.get('/health', async () => ({ status: 'ok' }));
  app.register(async (instance) => {
    await registerTaskRoutes(instance, useCases);
  });

  return app;
}
