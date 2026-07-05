import { InvalidTaskStatusError, InvalidTaskStatusTransitionError } from './errors';

export type TaskStatusValue = 'pending' | 'in_progress' | 'done';

/** Transicoes permitidas entre estados do ciclo de vida de uma Task. */
const ALLOWED_TRANSITIONS: Record<TaskStatusValue, TaskStatusValue[]> = {
  pending: ['in_progress', 'done'],
  in_progress: ['done', 'pending'],
  done: [],
};

/**
 * Value object que modela o status de uma Task e as regras de transicao
 * entre estados. Transicoes invalidas sao rejeitadas no proprio dominio.
 */
export class TaskStatus {
  private constructor(private readonly value: TaskStatusValue) {}

  static pending(): TaskStatus {
    return new TaskStatus('pending');
  }

  static inProgress(): TaskStatus {
    return new TaskStatus('in_progress');
  }

  static done(): TaskStatus {
    return new TaskStatus('done');
  }

  static fromString(value: string): TaskStatus {
    if (value !== 'pending' && value !== 'in_progress' && value !== 'done') {
      throw new InvalidTaskStatusError(value);
    }
    return new TaskStatus(value);
  }

  transitionTo(target: TaskStatus): TaskStatus {
    if (!ALLOWED_TRANSITIONS[this.value].includes(target.value)) {
      throw new InvalidTaskStatusTransitionError(this.value, target.value);
    }
    return target;
  }

  toString(): TaskStatusValue {
    return this.value;
  }

  equals(other: TaskStatus): boolean {
    return this.value === other.value;
  }
}
