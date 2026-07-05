import type { FastifyInstance } from 'fastify';
import type { CreateTask } from '../../../application/use-cases/create-task';
import type { GetTask } from '../../../application/use-cases/get-task';
import type { ListTasks } from '../../../application/use-cases/list-tasks';
import type { StartTask } from '../../../application/use-cases/start-task';
import type { CompleteTask } from '../../../application/use-cases/complete-task';
import type { DeleteTask } from '../../../application/use-cases/delete-task';
import { createTaskBodySchema, taskIdParamsSchema } from '../schemas';

export interface TaskUseCases {
  createTask: CreateTask;
  getTask: GetTask;
  listTasks: ListTasks;
  startTask: StartTask;
  completeTask: CompleteTask;
  deleteTask: DeleteTask;
}

export async function registerTaskRoutes(
  app: FastifyInstance,
  useCases: TaskUseCases,
): Promise<void> {
  app.post('/tasks', async (request, reply) => {
    const body = createTaskBodySchema.parse(request.body);
    const task = await useCases.createTask.execute(body);
    return reply.status(201).send(task);
  });

  app.get('/tasks', async () => {
    return useCases.listTasks.execute();
  });

  app.get('/tasks/:id', async (request) => {
    const { id } = taskIdParamsSchema.parse(request.params);
    return useCases.getTask.execute(id);
  });

  app.post('/tasks/:id/start', async (request) => {
    const { id } = taskIdParamsSchema.parse(request.params);
    return useCases.startTask.execute(id);
  });

  app.post('/tasks/:id/complete', async (request) => {
    const { id } = taskIdParamsSchema.parse(request.params);
    return useCases.completeTask.execute(id);
  });

  app.delete('/tasks/:id', async (request, reply) => {
    const { id } = taskIdParamsSchema.parse(request.params);
    await useCases.deleteTask.execute(id);
    return reply.status(204).send();
  });
}
