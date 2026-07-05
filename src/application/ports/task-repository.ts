import type { Task } from '../../domain/task';
import type { TaskId } from '../../domain/task-id';

/**
 * Port de saida (driven port). A camada de aplicacao depende desta abstracao,
 * nunca de uma implementacao concreta de persistencia.
 */
export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  delete(id: TaskId): Promise<void>;
}
