import type { Task } from '../../domain/task';
import type { TaskId } from '../../domain/task-id';
import type { TaskRepository } from '../../application/ports/task-repository';

/**
 * Adapter de persistencia em memoria. Util para testes e para rodar a
 * aplicacao sem dependencias externas (REPOSITORY_DRIVER=memory).
 */
export class InMemoryTaskRepository implements TaskRepository {
  private readonly store = new Map<string, Task>();

  async save(task: Task): Promise<void> {
    this.store.set(task.id.toString(), task);
  }

  async findById(id: TaskId): Promise<Task | null> {
    return this.store.get(id.toString()) ?? null;
  }

  async findAll(): Promise<Task[]> {
    return [...this.store.values()];
  }

  async delete(id: TaskId): Promise<void> {
    this.store.delete(id.toString());
  }
}
