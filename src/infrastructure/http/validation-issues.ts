import type { ZodError } from 'zod';

/**
 * Vocabulário fechado de códigos de erro de validação expostos pela API.
 * Não segue o código interno do Zod: a resposta 400 é contrato público e não
 * pode mudar quando a biblioteca muda de versão (o Zod 4 renomeou códigos,
 * reescreveu todas as mensagens e passou a incluir a regex do schema).
 */
export type ValidationIssueCode =
  | 'invalid_type'
  | 'invalid_format'
  | 'too_small'
  | 'too_big'
  | 'invalid_value'
  | 'invalid';

export interface ValidationIssue {
  /** Caminho do campo com ponto (ex.: `items.0.name`); vazio quando é o corpo inteiro. */
  readonly field: string;
  readonly code: ValidationIssueCode;
  readonly message: string;
}

const MESSAGES: Record<ValidationIssueCode, string> = {
  invalid_type: 'Campo ausente ou com tipo invalido.',
  invalid_format: 'Formato invalido.',
  too_small: 'Valor abaixo do minimo permitido.',
  too_big: 'Valor acima do maximo permitido.',
  invalid_value: 'Valor nao permitido.',
  invalid: 'Valor invalido.',
};

const CODES: Readonly<Record<string, ValidationIssueCode>> = {
  invalid_type: 'invalid_type',
  invalid_format: 'invalid_format',
  too_small: 'too_small',
  too_big: 'too_big',
  invalid_value: 'invalid_value',
};

/**
 * Traduz as issues do Zod para o formato estável. Só três campos saem:
 * nenhum detalhe interno do schema (regex, origem, valor recebido) chega ao
 * cliente.
 */
export function toValidationIssues(error: ZodError): ValidationIssue[] {
  return error.issues.map((issue) => {
    const code = CODES[issue.code] ?? 'invalid';
    return { field: issue.path.map(String).join('.'), code, message: MESSAGES[code] };
  });
}
