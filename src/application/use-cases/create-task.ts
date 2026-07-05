import { Task } from '../../domain/task';
import type { TaskRepository } from '../ports/task-repository';
import { toTaskDTO, type TaskDTO } from '../dto/task-dto';

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export class CreateTask {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<TaskDTO> {
    const task = Task.create(input);
    await this.tasks.save(task);
    return toTaskDTO(task);
  }
}
