import { describe, expect, it } from 'vitest';
import { z, ZodError } from 'zod';
import { createTaskBodySchema, taskIdParamsSchema } from '../../../src/infrastructure/http/schemas';
import { toValidationIssues } from '../../../src/infrastructure/http/validation-issues';

function issuesOf(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input);
  if (result.success) throw new Error('esperava falha de validacao');
  return toValidationIssues(result.error);
}

describe('toValidationIssues', () => {
  it('campo ausente', () => {
    expect(issuesOf(createTaskBodySchema, {})).toEqual([
      { field: 'title', code: 'invalid_type', message: 'Campo ausente ou com tipo invalido.' },
    ]);
  });

  it('tipo errado', () => {
    expect(issuesOf(createTaskBodySchema, { title: 'ok', description: 5 })).toEqual([
      { field: 'description', code: 'invalid_type', message: 'Campo ausente ou com tipo invalido.' },
    ]);
  });

  it('abaixo do minimo e acima do maximo', () => {
    expect(issuesOf(createTaskBodySchema, { title: '   ' })).toEqual([
      { field: 'title', code: 'too_small', message: 'Valor abaixo do minimo permitido.' },
    ]);
    expect(issuesOf(createTaskBodySchema, { title: 'x'.repeat(201) })).toEqual([
      { field: 'title', code: 'too_big', message: 'Valor acima do maximo permitido.' },
    ]);
  });

  it('formato invalido', () => {
    expect(issuesOf(taskIdParamsSchema, { id: 'nao-e-uuid' })).toEqual([
      { field: 'id', code: 'invalid_format', message: 'Formato invalido.' },
    ]);
  });

  it('valor fora do enum', () => {
    expect(issuesOf(z.object({ status: z.enum(['a', 'b']) }), { status: 'c' })).toEqual([
      { field: 'status', code: 'invalid_value', message: 'Valor nao permitido.' },
    ]);
  });

  it('codigo desconhecido vira "invalid"; caminho aninhado usa ponto; raiz fica vazia', () => {
    const nested = issuesOf(z.object({ items: z.array(z.object({ name: z.string() })) }), {
      items: [{ name: 'a' }, {}],
    });
    expect(nested[0]?.field).toBe('items.1.name');

    expect(issuesOf(z.object({ a: z.string() }).strict(), { a: 'x', extra: 1 })).toEqual([
      { field: '', code: 'invalid', message: 'Valor invalido.' },
    ]);
  });

  it('nao expoe detalhes internos do schema (regressao do Zod 4)', () => {
    const result = taskIdParamsSchema.safeParse({ id: 'nao-e-uuid' });
    const issues = toValidationIssues(result.error as ZodError);
    const json = JSON.stringify(issues);
    expect(Object.keys(issues[0] ?? {}).sort()).toEqual(['code', 'field', 'message']);
    // 'format' não entra na lista: faz parte do próprio código público "invalid_format".
    for (const internal of ['pattern', 'origin', 'regex', '0-9a-fA-F', 'expected', 'received']) {
      expect(json).not.toContain(internal);
    }
  });
});
