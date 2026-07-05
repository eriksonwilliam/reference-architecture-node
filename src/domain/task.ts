import { InvalidTaskTitleError } from './errors';
import { TaskId } from './task-id';
import { TaskStatus } from './task-status';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

interface TaskProps {
  id: TaskId;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskProps {
  title: string;
  description?: string;
}

export interface RestoreTaskProps {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root do dominio. Encapsula as invariantes de uma tarefa:
 * titulo valido, descricao limitada e transicoes de status controladas.
 */
export class Task {
  private constructor(private readonly props: TaskProps) {}

  /** Cria uma nova tarefa ja no estado inicial (pending). */
  static create(input: CreateTaskProps): Task {
    const now = new Date();
    return new Task({
      id: TaskId.generate(),
      title: Task.normalizeTitle(input.title),
      description: Task.normalizeDescription(input.description),
      status: TaskStatus.pending(),
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Reconstroi uma tarefa a partir de dados ja persistidos. */
  static restore(props: RestoreTaskProps): Task {
    return new Task({
      id: TaskId.fromString(props.id),
      title: props.title,
      description: props.description,
      status: TaskStatus.fromString(props.status),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  private static normalizeTitle(raw: string): string {
    const title = raw.trim();
    if (title.length < 1 || title.length > MAX_TITLE_LENGTH) {
      throw new InvalidTaskTitleError();
    }
    return title;
  }

  private static normalizeDescription(raw: string | undefined): string {
    return (raw ?? '').trim().slice(0, MAX_DESCRIPTION_LENGTH);
  }

  start(): void {
    this.props.status = this.props.status.transitionTo(TaskStatus.inProgress());
    this.touch();
  }

  complete(): void {
    this.props.status = this.props.status.transitionTo(TaskStatus.done());
    this.touch();
  }

  rename(title: string): void {
    this.props.title = Task.normalizeTitle(title);
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  get id(): TaskId {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }
}
