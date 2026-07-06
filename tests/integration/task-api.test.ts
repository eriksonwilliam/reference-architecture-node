import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/infrastructure/http/server';
import { InMemoryTaskRepository } from '../../src/infrastructure/persistence/in-memory-task-repository';
import { CreateTask } from '../../src/application/use-cases/create-task';
import { GetTask } from '../../src/application/use-cases/get-task';
import { ListTasks } from '../../src/application/use-cases/list-tasks';
import { StartTask } from '../../src/application/use-cases/start-task';
import { CompleteTask } from '../../src/application/use-cases/complete-task';
import { DeleteTask } from '../../src/application/use-cases/delete-task';
import type { TaskUseCases } from '../../src/infrastructure/http/routes/task-routes';

function buildUseCases(): TaskUseCases {
  const repo = new InMemoryTaskRepository();
  return {
    createTask: new CreateTask(repo),
    getTask: new GetTask(repo),
    listTasks: new ListTasks(repo),
    startTask: new StartTask(repo),
    completeTask: new CompleteTask(repo),
    deleteTask: new DeleteTask(repo),
  };
}

const UNKNOWN_ID = '99999999-9999-4999-8999-999999999999';

describe('API de Tasks', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildServer(buildUseCases());
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  async function createTask(title = 'Tarefa'): Promise<string> {
    const res = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title },
    });
    return res.json<{ id: string }>().id;
  }

  it('GET /health responde ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('GET /docs/json expoe a especificacao OpenAPI', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs/json' });
    expect(res.statusCode).toBe(200);
    const spec = res.json<{ openapi: string; paths: Record<string, unknown> }>();
    expect(spec.openapi).toBeDefined();
    expect(spec.paths['/tasks']).toBeDefined();
  });

  it('POST /tasks cria uma tarefa (201)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Escrever testes', description: 'cobertura total' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json<{ status: string; title: string }>();
    expect(body.status).toBe('pending');
    expect(body.title).toBe('Escrever testes');
  });

  it('POST /tasks rejeita payload invalido (400)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { description: 'sem titulo' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json<{ error: string }>().error).toBe('ValidationError');
  });

  it('GET /tasks lista as tarefas', async () => {
    await createTask('A');
    await createTask('B');
    const res = await app.inject({ method: 'GET', url: '/tasks' });
    expect(res.statusCode).toBe(200);
    expect(res.json<unknown[]>()).toHaveLength(2);
  });

  it('GET /tasks/:id retorna a tarefa', async () => {
    const id = await createTask();
    const res = await app.inject({ method: 'GET', url: `/tasks/${id}` });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ id: string }>().id).toBe(id);
  });

  it('GET /tasks/:id retorna 404 quando nao existe', async () => {
    const res = await app.inject({ method: 'GET', url: `/tasks/${UNKNOWN_ID}` });
    expect(res.statusCode).toBe(404);
    expect(res.json<{ error: string }>().error).toBe('TaskNotFoundError');
  });

  it('GET /tasks/:id retorna 400 para uuid invalido', async () => {
    const res = await app.inject({ method: 'GET', url: '/tasks/nao-e-uuid' });
    expect(res.statusCode).toBe(400);
    expect(res.json<{ error: string }>().error).toBe('ValidationError');
  });

  it('POST /tasks/:id/start move para in_progress', async () => {
    const id = await createTask();
    const res = await app.inject({ method: 'POST', url: `/tasks/${id}/start` });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ status: string }>().status).toBe('in_progress');
  });

  it('POST /tasks/:id/complete move para done', async () => {
    const id = await createTask();
    const res = await app.inject({ method: 'POST', url: `/tasks/${id}/complete` });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ status: string }>().status).toBe('done');
  });

  it('POST /tasks/:id/start em tarefa concluida retorna 409', async () => {
    const id = await createTask();
    await app.inject({ method: 'POST', url: `/tasks/${id}/complete` });
    const res = await app.inject({ method: 'POST', url: `/tasks/${id}/start` });
    expect(res.statusCode).toBe(409);
    expect(res.json<{ error: string }>().error).toBe(
      'InvalidTaskStatusTransitionError',
    );
  });

  it('DELETE /tasks/:id remove a tarefa (204)', async () => {
    const id = await createTask();
    const res = await app.inject({ method: 'DELETE', url: `/tasks/${id}` });
    expect(res.statusCode).toBe(204);
    const check = await app.inject({ method: 'GET', url: `/tasks/${id}` });
    expect(check.statusCode).toBe(404);
  });

  it('DELETE /tasks/:id retorna 404 quando nao existe', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/tasks/${UNKNOWN_ID}` });
    expect(res.statusCode).toBe(404);
  });
});

describe('buildServer', () => {
  it('aceita opcoes de logger explicitas', async () => {
    const app = buildServer(buildUseCases(), { logger: false });
    await app.ready();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    await app.close();
  });
});
