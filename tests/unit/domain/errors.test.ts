import { describe, expect, it } from 'vitest';
import {
  DomainError,
  InvalidTaskIdError,
  InvalidTaskStatusError,
  InvalidTaskStatusTransitionError,
  InvalidTaskTitleError,
  TaskNotFoundError,
} from '../../../src/domain/errors';

describe('erros de dominio', () => {
  it('todos derivam de DomainError e expoem o name da subclasse', () => {
    const errors = [
      new InvalidTaskTitleError(),
      new InvalidTaskIdError('x'),
      new InvalidTaskStatusError('x'),
      new InvalidTaskStatusTransitionError('pending', 'done'),
      new TaskNotFoundError('id'),
    ];

    for (const error of errors) {
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe(error.constructor.name);
      expect(error.message.length).toBeGreaterThan(0);
    }
  });
});
