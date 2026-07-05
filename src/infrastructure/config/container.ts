import type { Env } from './env';
import type { TaskRepository } from '../../application/ports/task-repository';
import { InMemoryTaskRepository } from '../persistence/in-memory-task-repository';
import { PostgresTaskRepository } from '../persistence/postgres-task-repository';
import { CreateTask } from '../../application/use-cases/create-task';
import { GetTask } from '../../application/use-cases/get-task';
import { ListTasks } from '../../application/use-cases/list-tasks';
import { StartTask } from '../../application/use-cases/start-task';
import { CompleteTask } from '../../application/use-cases/complete-task';
import { DeleteTask } from '../../application/use-cases/delete-task';
import type { TaskUseCases } from '../http/routes/task-routes';

export interface Container {
  repository: TaskRepository;
  useCases: TaskUseCases;
}

/**
 * Composition root: escolhe os adapters concretos com base no ambiente
 * e injeta as dependencias nos use cases.
 */
export function buildContainer(env: Env): Container {
  const repository: TaskRepository =
    env.REPOSITORY_DRIVER === 'postgres' && env.DATABASE_URL
      ? new PostgresTaskRepository(env.DATABASE_URL)
      : new InMemoryTaskRepository();

  const useCases: TaskUseCases = {
    createTask: new CreateTask(repository),
    getTask: new GetTask(repository),
    listTasks: new ListTasks(repository),
    startTask: new StartTask(repository),
    completeTask: new CompleteTask(repository),
    deleteTask: new DeleteTask(repository),
  };

  return { repository, useCases };
}
