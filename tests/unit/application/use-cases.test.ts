import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from '../../../src/infrastructure/persistence/in-memory-task-repository';
import { CreateTask } from '../../../src/application/use-cases/create-task';
import { GetTask } from '../../../src/application/use-cases/get-task';
import { ListTasks } from '../../../src/application/use-cases/list-tasks';
import { StartTask } from '../../../src/application/use-cases/start-task';
import { CompleteTask } from '../../../src/application/use-cases/complete-task';
import { DeleteTask } from '../../../src/application/use-cases/delete-task';
import { TaskNotFoundError } from '../../../src/domain/errors';

const UNKNOWN_ID = '99999999-9999-4999-8999-999999999999';

describe('use cases de Task', () => {
  let repo: InMemoryTaskRepository;
  let createTask: CreateTask;
  let getTask: GetTask;
  let listTasks: ListTasks;
  let startTask: StartTask;
  let completeTask: CompleteTask;
  let deleteTask: DeleteTask;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
    createTask = new CreateTask(repo);
    getTask = new GetTask(repo);
    listTasks = new ListTasks(repo);
    startTask = new StartTask(repo);
    completeTask = new CompleteTask(repo);
    deleteTask = new DeleteTask(repo);
  });

  it('CreateTask persiste e retorna o DTO', async () => {
    const dto = await createTask.execute({ title: 'Nova tarefa' });
    expect(dto.status).toBe('pending');
    expect(dto.title).toBe('Nova tarefa');
    const found = await getTask.execute(dto.id);
    expect(found.id).toBe(dto.id);
  });

  it('GetTask lanca quando a tarefa nao existe', async () => {
    await expect(getTask.execute(UNKNOWN_ID)).rejects.toThrow(TaskNotFoundError);
  });

  it('ListTasks retorna todas as tarefas', async () => {
    await createTask.execute({ title: 'A' });
    await createTask.execute({ title: 'B' });
    const all = await listTasks.execute();
    expect(all).toHaveLength(2);
  });

  it('StartTask move a tarefa para in_progress', async () => {
    const { id } = await createTask.execute({ title: 'Iniciar' });
    const dto = await startTask.execute(id);
    expect(dto.status).toBe('in_progress');
  });

  it('StartTask lanca quando a tarefa nao existe', async () => {
    await expect(startTask.execute(UNKNOWN_ID)).rejects.toThrow(TaskNotFoundError);
  });

  it('CompleteTask move a tarefa para done', async () => {
    const { id } = await createTask.execute({ title: 'Concluir' });
    const dto = await completeTask.execute(id);
    expect(dto.status).toBe('done');
  });

  it('CompleteTask lanca quando a tarefa nao existe', async () => {
    await expect(completeTask.execute(UNKNOWN_ID)).rejects.toThrow(TaskNotFoundError);
  });

  it('DeleteTask remove a tarefa', async () => {
    const { id } = await createTask.execute({ title: 'Remover' });
    await deleteTask.execute(id);
    await expect(getTask.execute(id)).rejects.toThrow(TaskNotFoundError);
  });

  it('DeleteTask lanca quando a tarefa nao existe', async () => {
    await expect(deleteTask.execute(UNKNOWN_ID)).rejects.toThrow(TaskNotFoundError);
  });
});
