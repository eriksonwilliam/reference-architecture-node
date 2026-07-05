import { describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory-task-repository';
import { Task } from '../../../src/domain/task';
import { TaskId } from '../../../src/domain/task-id';

const UNKNOWN_ID = TaskId.fromString('88888888-8888-4888-8888-888888888888');

describe('InMemoryTaskRepository', () => {
  it('salva e recupera por id', async () => {
    const repo = new InMemoryTaskRepository();
    const task = Task.create({ title: 'Persistir' });

    await repo.save(task);
    const found = await repo.findById(task.id);

    expect(found).toBe(task);
  });

  it('retorna null quando o id nao existe', async () => {
    const repo = new InMemoryTaskRepository();
    expect(await repo.findById(UNKNOWN_ID)).toBeNull();
  });

  it('lista todas as tarefas salvas', async () => {
    const repo = new InMemoryTaskRepository();
    await repo.save(Task.create({ title: 'A' }));
    await repo.save(Task.create({ title: 'B' }));

    expect(await repo.findAll()).toHaveLength(2);
  });

  it('remove uma tarefa existente', async () => {
    const repo = new InMemoryTaskRepository();
    const task = Task.create({ title: 'Remover' });
    await repo.save(task);

    await repo.delete(task.id);

    expect(await repo.findById(task.id)).toBeNull();
  });
});
