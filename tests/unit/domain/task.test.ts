import { describe, expect, it } from 'vitest';
import { Task } from '../../../src/domain/task';
import {
  InvalidTaskStatusTransitionError,
  InvalidTaskTitleError,
} from '../../../src/domain/errors';

describe('Task', () => {
  it('cria uma tarefa no estado pending', () => {
    const task = Task.create({ title: 'Estudar arquitetura hexagonal' });

    expect(task.title).toBe('Estudar arquitetura hexagonal');
    expect(task.description).toBe('');
    expect(task.status.toString()).toBe('pending');
    expect(task.id.toString()).toHaveLength(36);
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
  });

  it('normaliza titulo e descricao ao criar', () => {
    const task = Task.create({ title: '  Titulo  ', description: '  desc  ' });
    expect(task.title).toBe('Titulo');
    expect(task.description).toBe('desc');
  });

  it('rejeita titulo vazio', () => {
    expect(() => Task.create({ title: '   ' })).toThrow(InvalidTaskTitleError);
  });

  it('rejeita titulo acima do limite', () => {
    expect(() => Task.create({ title: 'a'.repeat(201) })).toThrow(
      InvalidTaskTitleError,
    );
  });

  it('reconstroi uma tarefa persistida', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');
    const task = Task.restore({
      id: '33333333-3333-4333-8333-333333333333',
      title: 'Persistida',
      description: 'x',
      status: 'in_progress',
      createdAt,
      updatedAt,
    });

    expect(task.id.toString()).toBe('33333333-3333-4333-8333-333333333333');
    expect(task.status.toString()).toBe('in_progress');
    expect(task.createdAt.toISOString()).toBe(createdAt.toISOString());
    expect(task.updatedAt.toISOString()).toBe(updatedAt.toISOString());
  });

  it('transiciona de pending para in_progress e para done', () => {
    const task = Task.create({ title: 'Fluxo completo' });
    task.start();
    expect(task.status.toString()).toBe('in_progress');
    task.complete();
    expect(task.status.toString()).toBe('done');
  });

  it('impede iniciar uma tarefa concluida', () => {
    const task = Task.create({ title: 'Concluida' });
    task.complete();
    expect(() => task.start()).toThrow(InvalidTaskStatusTransitionError);
  });

  it('renomeia com validacao', () => {
    const task = Task.create({ title: 'Antigo' });
    task.rename('  Novo titulo  ');
    expect(task.title).toBe('Novo titulo');
    expect(() => task.rename('')).toThrow(InvalidTaskTitleError);
  });

  it('expoe copias das datas (imutabilidade)', () => {
    const task = Task.create({ title: 'Datas' });
    const created = task.createdAt;
    created.setFullYear(1999);
    expect(task.createdAt.getFullYear()).not.toBe(1999);
  });
});
