import { TaskNotFoundError } from '../../domain/errors';
import { TaskId } from '../../domain/task-id';
import type { TaskRepository } from '../ports/task-repository';

export class DeleteTask {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(id: string): Promise<void> {
    const taskId = TaskId.fromString(id);
    const task = await this.tasks.findById(taskId);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    await this.tasks.delete(taskId);
  }
}
