import { describe, expect, it } from 'vitest';
import { TaskId } from '../../../src/domain/task-id';
import { InvalidTaskIdError } from '../../../src/domain/errors';

describe('TaskId', () => {
  it('gera um UUID valido', () => {
    const id = TaskId.generate();
    expect(id.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('reconstroi a partir de uma string valida', () => {
    const value = '11111111-1111-4111-8111-111111111111';
    expect(TaskId.fromString(value).toString()).toBe(value);
  });

  it('rejeita uma string invalida', () => {
    expect(() => TaskId.fromString('nao-e-uuid')).toThrow(InvalidTaskIdError);
  });

  it('compara identidades por valor', () => {
    const value = '22222222-2222-4222-8222-222222222222';
    const a = TaskId.fromString(value);
    const b = TaskId.fromString(value);
    const c = TaskId.generate();

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
