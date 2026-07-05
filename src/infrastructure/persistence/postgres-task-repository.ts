import { Pool } from 'pg';
import { Task } from '../../domain/task';
import type { TaskId } from '../../domain/task-id';
import type { TaskRepository } from '../../application/ports/task-repository';

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Adapter de persistencia em PostgreSQL. Validado via docker compose e
 * testes de integracao reais (por isso excluido da cobertura unitaria).
 */
export class PostgresTaskRepository implements TaskRepository {
  private readonly pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async save(task: Task): Promise<void> {
    await this.pool.query(
      `INSERT INTO tasks (id, title, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         status = EXCLUDED.status,
         updated_at = EXCLUDED.updated_at`,
      [
        task.id.toString(),
        task.title,
        task.description,
        task.status.toString(),
        task.createdAt,
        task.updatedAt,
      ],
    );
  }

  async findById(id: TaskId): Promise<Task | null> {
    const result = await this.pool.query<TaskRow>(
      'SELECT * FROM tasks WHERE id = $1',
      [id.toString()],
    );
    const row = result.rows[0];
    return row ? PostgresTaskRepository.toDomain(row) : null;
  }

  async findAll(): Promise<Task[]> {
    const result = await this.pool.query<TaskRow>(
      'SELECT * FROM tasks ORDER BY created_at DESC',
    );
    return result.rows.map((row) => PostgresTaskRepository.toDomain(row));
  }

  async delete(id: TaskId): Promise<void> {
    await this.pool.query('DELETE FROM tasks WHERE id = $1', [id.toString()]);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private static toDomain(row: TaskRow): Task {
    return Task.restore({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
