import { TaskNotFoundError } from '../../domain/errors';
import { TaskId } from '../../domain/task-id';
import type { TaskRepository } from '../ports/task-repository';
import { toTaskDTO, type TaskDTO } from '../dto/task-dto';

export class StartTask {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(id: string): Promise<TaskDTO> {
    const taskId = TaskId.fromString(id);
    const task = await this.tasks.findById(taskId);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    task.start();
    await this.tasks.save(task);
    return toTaskDTO(task);
  }
}
