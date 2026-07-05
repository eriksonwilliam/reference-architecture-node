import { randomUUID } from 'node:crypto';
import { InvalidTaskIdError } from './errors';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Value object que representa a identidade de uma Task.
 * Garante que o identificador sempre seja um UUID valido.
 */
export class TaskId {
  private constructor(private readonly value: string) {}

  static generate(): TaskId {
    return new TaskId(randomUUID());
  }

  static fromString(value: string): TaskId {
    if (!UUID_REGEX.test(value)) {
      throw new InvalidTaskIdError(value);
    }
    return new TaskId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }
}
