import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
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

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Task API',
        description:
          'API de tarefas — template de arquitetura hexagonal (ports & adapters).',
        version: '0.1.0',
      },
      tags: [{ name: 'tasks', description: 'Operacoes de tarefas' }],
    },
  });
  app.register(fastifySwaggerUi, { routePrefix: '/docs' });

  app.setErrorHandler(errorHandler);
  app.get(
    '/health',
    { schema: { tags: ['health'], summary: 'Health check' } },
    async () => ({ status: 'ok' }),
  );
  app.register(async (instance) => {
    await registerTaskRoutes(instance, useCases);
  });

  return app;
}
