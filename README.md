# reference-architecture-node

Template de referência em **Node.js + TypeScript** com **arquitetura hexagonal
(ports & adapters)**, DDD leve, testes automatizados com cobertura total e
pipeline de CI. Serve como ponto de partida para serviços HTTP limpos,
testáveis e independentes de framework/infra.

O domínio de exemplo é um gerenciador de tarefas (`Task`), simples o bastante
para não distrair e completo o bastante para exercitar entidades, value
objects, regras de transição de estado, use cases e múltiplos adapters de
persistência.

## Stack

- **Runtime:** Node.js 22+
- **Linguagem:** TypeScript 5 (ESM, `strict`)
- **HTTP:** Fastify 5
- **Validação:** Zod
- **Persistência:** PostgreSQL (adapter) + adapter em memória
- **Testes:** Vitest + cobertura V8 (limite de 100%)
- **Qualidade:** ESLint 9 (flat config) + `tsc --noEmit`
- **Build:** tsup (bundle ESM)
- **Infra:** Docker multi-stage + docker compose

## Arquitetura

```
src/
├── domain/                 # Regras de negócio puras (sem dependências externas)
│   ├── task.ts             # Aggregate root
│   ├── task-id.ts          # Value object (UUID)
│   ├── task-status.ts      # Value object + regras de transição
│   └── errors.ts           # Erros de domínio
├── application/            # Casos de uso e contratos (ports)
│   ├── ports/              # Interfaces (driven ports)
│   ├── dto/                # Objetos de transferência
│   └── use-cases/          # Orquestração das regras de domínio
├── infrastructure/         # Adapters concretos (mundo externo)
│   ├── http/               # Fastify: server, rotas, schemas, error handler
│   ├── persistence/        # Adapters in-memory e PostgreSQL
│   └── config/             # Env validado + composition root
└── main.ts                 # Bootstrap
```

A dependência aponta **sempre para dentro**: `infrastructure` conhece
`application`, que conhece `domain`. O domínio não conhece ninguém. Trocar o
Postgres por outro banco, ou o Fastify por outro framework, não toca o domínio
nem os use cases.

## Como rodar

### Pré-requisitos

- Node.js 22 ou superior
- Docker (opcional, para rodar com PostgreSQL)

### Local (repositório em memória)

```bash
npm install
cp .env.example .env
npm run dev
```

A API sobe em `http://localhost:3000`.

### Com Docker + PostgreSQL

```bash
docker compose up --build
```

Sobe o PostgreSQL e a API já configurada com `REPOSITORY_DRIVER=postgres`.

## Endpoints

| Método | Rota                  | Descrição                          |
| ------ | --------------------- | ---------------------------------- |
| GET    | `/health`             | Health check                       |
| POST   | `/tasks`              | Cria uma tarefa                    |
| GET    | `/tasks`              | Lista todas as tarefas             |
| GET    | `/tasks/:id`          | Busca uma tarefa por id            |
| POST   | `/tasks/:id/start`    | Move a tarefa para `in_progress`   |
| POST   | `/tasks/:id/complete` | Move a tarefa para `done`          |
| DELETE | `/tasks/:id`          | Remove uma tarefa                  |

Exemplo:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Estudar arquitetura hexagonal"}'
```

## Scripts

| Script              | Descrição                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Sobe em modo watch (tsx)                   |
| `npm run build`     | Gera o bundle de produção em `dist/`       |
| `npm start`         | Executa o bundle compilado                 |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`)         |
| `npm run lint`      | ESLint                                     |
| `npm test`          | Executa a suíte de testes                  |
| `npm run coverage`  | Testes + relatório de cobertura            |

## Testes e cobertura

```bash
npm run coverage
```

A cobertura é exigida em **100%** (linhas, funções, statements e branches). Os
adapters validados por integração real (PostgreSQL) e o composition root ficam
fora da métrica unitária, pois são exercitados via `docker compose`.

## Licença

MIT.
