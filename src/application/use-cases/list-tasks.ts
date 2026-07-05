import type { TaskRepository } from '../ports/task-repository';
import { toTaskDTO, type TaskDTO } from '../dto/task-dto';

export class ListTasks {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(): Promise<TaskDTO[]> {
    const tasks = await this.tasks.findAll();
    return tasks.map(toTaskDTO);
  }
}
