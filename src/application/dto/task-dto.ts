import type { Task } from '../../domain/task';

/** Representacao serializavel de uma Task para o mundo externo. */
export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function toTaskDTO(task: Task): TaskDTO {
  return {
    id: task.id.toString(),
    title: task.title,
    description: task.description,
    status: task.status.toString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
