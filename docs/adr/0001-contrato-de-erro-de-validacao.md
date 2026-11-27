# ADR 0001: contrato estável para erros de validação

- **Situação**: aceita (26/11/2026)
- **Contexto da mudança**: atualização do Zod 3 para 4 (correção de
  vulnerabilidade de exaustão de memória, GHSA-mrhx-c7xc-m3w5)

## Contexto

A resposta 400 devolvia `details: error.issues`, ou seja, o objeto interno do
Zod. Comparando as duas versões com os schemas deste projeto:

- os códigos mudaram (`invalid_string` → `invalid_format`);
- todas as mensagens mudaram ("Required" → "Invalid input: expected string,
  received undefined");
- o Zod 4 passou a incluir `origin`, `format` e a **regex do schema**
  (`pattern`) em cada issue.

Ou seja, atualizar uma dependência alterava, sem aviso, o contrato público da
API e expunha detalhes de implementação.

## Decisão

O handler de erro traduz as issues para um formato próprio, definido em
`src/infrastructure/http/validation-issues.ts`:

```json
{
  "error": "ValidationError",
  "message": "Requisicao invalida.",
  "details": [{ "field": "title", "code": "invalid_type", "message": "Campo ausente ou com tipo invalido." }]
}
```

- `field`: caminho com ponto (`items.1.name`); vazio quando o erro é do corpo inteiro.
- `code`: vocabulário fechado: `invalid_type`, `invalid_format`, `too_small`,
  `too_big`, `invalid_value` e `invalid` (qualquer outro caso).
- `message`: texto nosso, um por código.

Status 400, `error` e `message` continuam como antes.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Repassar `error.issues` (como antes) | contrato muda a cada versão do Zod e expõe a regex |
| Usar `z.prettifyError` / `flatten` | formato ainda definido pela biblioteca |
| Mensagens com o limite (ex.: "mínimo 1 caractere") | mais útil, mas acopla a mensagem ao schema; pode entrar depois como campo separado |

## Consequências

- Clientes que liam `details[].message` do Zod veem textos novos **uma
  vez**, nesta mudança; depois disso o contrato fica estável.
- Um código novo do Zod não quebra a API: cai em `invalid`.
- Testes de integração fixam o corpo exato do 400; trocar a biblioteca de
  validação não pode mudá-lo sem um teste falhar.
- Efeito colateral do Zod 4 que **não** é coberto por esta decisão: UUIDs
  fora do padrão RFC (ex.: `11111111-1111-1111-1111-111111111111`) passam a
  dar 400 em vez de 404. Os IDs gerados pela aplicação (`randomUUID`, v4) não
  são afetados.
