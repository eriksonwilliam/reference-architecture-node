/**
 * Erro base do dominio. Toda regra de negocio violada deriva desta classe,
 * o que permite tratar erros de dominio de forma uniforme nas camadas externas.
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidTaskTitleError extends DomainError {
  constructor() {
    super('O titulo da tarefa deve ter entre 1 e 200 caracteres.');
  }
}

export class InvalidTaskIdError extends DomainError {
  constructor(value: string) {
    super(`Identificador de tarefa invalido: "${value}".`);
  }
}

export class InvalidTaskStatusError extends DomainError {
  constructor(value: string) {
    super(`Status de tarefa invalido: "${value}".`);
  }
}

export class InvalidTaskStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Transicao de status invalida: de "${from}" para "${to}".`);
  }
}

export class TaskNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Tarefa nao encontrada: "${id}".`);
  }
}
