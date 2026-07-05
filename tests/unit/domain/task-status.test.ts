import { describe, expect, it } from 'vitest';
import { TaskStatus } from '../../../src/domain/task-status';
import {
  InvalidTaskStatusError,
  InvalidTaskStatusTransitionError,
} from '../../../src/domain/errors';

describe('TaskStatus', () => {
  it('cria os estados nomeados', () => {
    expect(TaskStatus.pending().toString()).toBe('pending');
    expect(TaskStatus.inProgress().toString()).toBe('in_progress');
    expect(TaskStatus.done().toString()).toBe('done');
  });

  it('reconstroi a partir de strings validas', () => {
    expect(TaskStatus.fromString('pending').equals(TaskStatus.pending())).toBe(true);
    expect(TaskStatus.fromString('in_progress').equals(TaskStatus.inProgress())).toBe(true);
    expect(TaskStatus.fromString('done').equals(TaskStatus.done())).toBe(true);
  });

  it('rejeita string de status invalida', () => {
    expect(() => TaskStatus.fromString('cancelled')).toThrow(InvalidTaskStatusError);
  });

  it('permite transicoes validas', () => {
    const next = TaskStatus.pending().transitionTo(TaskStatus.inProgress());
    expect(next.equals(TaskStatus.inProgress())).toBe(true);
  });

  it('rejeita transicoes invalidas', () => {
    expect(() =>
      TaskStatus.done().transitionTo(TaskStatus.inProgress()),
    ).toThrow(InvalidTaskStatusTransitionError);
  });

  it('compara status por valor', () => {
    expect(TaskStatus.pending().equals(TaskStatus.pending())).toBe(true);
    expect(TaskStatus.pending().equals(TaskStatus.done())).toBe(false);
  });
});
