import { TaskNotFoundError } from '../../domain/errors';
import { TaskId } from '../../domain/task-id';
import type { TaskRepository } from '../ports/task-repository';
import { toTaskDTO, type TaskDTO } from '../dto/task-dto';

export class GetTask {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(id: string): Promise<TaskDTO> {
    const task = await this.tasks.findById(TaskId.fromString(id));
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    return toTaskDTO(task);
  }
}
