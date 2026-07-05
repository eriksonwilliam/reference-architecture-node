import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import {
  DomainError,
  InvalidTaskStatusTransitionError,
  TaskNotFoundError,
} from '../../domain/errors';

/**
 * Mapeia erros das camadas internas para respostas HTTP consistentes.
 * - ZodError            -> 400 (payload invalido)
 * - TaskNotFoundError   -> 404
 * - Transicao invalida  -> 409 (conflito de estado)
 * - Demais DomainError  -> 400
 * - Qualquer outro erro -> 500
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ZodError) {
    reply.status(400).send({
      error: 'ValidationError',
      message: 'Requisicao invalida.',
      details: error.issues,
    });
    return;
  }

  if (error instanceof TaskNotFoundError) {
    reply.status(404).send({ error: error.name, message: error.message });
    return;
  }

  if (error instanceof InvalidTaskStatusTransitionError) {
    reply.status(409).send({ error: error.name, message: error.message });
    return;
  }

  if (error instanceof DomainError) {
    reply.status(400).send({ error: error.name, message: error.message });
    return;
  }

  request.log.error(error);
  reply.status(500).send({
    error: 'InternalServerError',
    message: 'Erro interno do servidor.',
  });
}
