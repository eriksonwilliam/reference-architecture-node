import { describe, expect, it, vi } from 'vitest';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { errorHandler } from '../../../src/infrastructure/http/error-handler';
import {
  InvalidTaskStatusTransitionError,
  InvalidTaskTitleError,
  TaskNotFoundError,
} from '../../../src/domain/errors';

interface CapturedReply {
  statusCode?: number;
  payload?: unknown;
  reply: FastifyReply;
}

function createReply(): CapturedReply {
  const captured: CapturedReply = { reply: {} as FastifyReply };
  const reply = {
    status(code: number) {
      captured.statusCode = code;
      return this;
    },
    send(payload: unknown) {
      captured.payload = payload;
      return this;
    },
  } as unknown as FastifyReply;
  captured.reply = reply;
  return captured;
}

function createRequest(): FastifyRequest {
  return { log: { error: vi.fn() } } as unknown as FastifyRequest;
}

describe('errorHandler', () => {
  it('mapeia ZodError para 400 ValidationError', () => {
    const zodError = z.object({ title: z.string() }).safeParse({});
    const error = (
      zodError.success ? null : zodError.error
    ) as unknown as FastifyError;
    const captured = createReply();

    errorHandler(error, createRequest(), captured.reply);

    expect(captured.statusCode).toBe(400);
    expect((captured.payload as { error: string }).error).toBe('ValidationError');
  });

  it('mapeia TaskNotFoundError para 404', () => {
    const captured = createReply();
    errorHandler(
      new TaskNotFoundError('id') as unknown as FastifyError,
      createRequest(),
      captured.reply,
    );
    expect(captured.statusCode).toBe(404);
  });

  it('mapeia transicao invalida para 409', () => {
    const captured = createReply();
    errorHandler(
      new InvalidTaskStatusTransitionError('done', 'pending') as unknown as FastifyError,
      createRequest(),
      captured.reply,
    );
    expect(captured.statusCode).toBe(409);
  });

  it('mapeia demais erros de dominio para 400', () => {
    const captured = createReply();
    errorHandler(
      new InvalidTaskTitleError() as unknown as FastifyError,
      createRequest(),
      captured.reply,
    );
    expect(captured.statusCode).toBe(400);
  });

  it('mapeia erros desconhecidos para 500 e loga', () => {
    const captured = createReply();
    const request = createRequest();
    errorHandler(
      new Error('falha inesperada') as FastifyError,
      request,
      captured.reply,
    );
    expect(captured.statusCode).toBe(500);
    expect((captured.payload as { error: string }).error).toBe('InternalServerError');
    expect(request.log.error).toHaveBeenCalledOnce();
  });
});
