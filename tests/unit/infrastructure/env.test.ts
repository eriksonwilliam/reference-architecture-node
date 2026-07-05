import { describe, expect, it } from 'vitest';
import { loadEnv } from '../../../src/infrastructure/config/env';

describe('loadEnv', () => {
  it('aplica os valores padrao quando o ambiente esta vazio', () => {
    const env = loadEnv({});
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.HOST).toBe('0.0.0.0');
    expect(env.REPOSITORY_DRIVER).toBe('memory');
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it('faz coercao e respeita valores fornecidos', () => {
    const env = loadEnv({
      NODE_ENV: 'production',
      PORT: '8080',
      HOST: '127.0.0.1',
      REPOSITORY_DRIVER: 'postgres',
      DATABASE_URL: 'postgres://app:app@localhost:5432/tasks',
    });
    expect(env.NODE_ENV).toBe('production');
    expect(env.PORT).toBe(8080);
    expect(env.REPOSITORY_DRIVER).toBe('postgres');
  });

  it('rejeita configuracao invalida', () => {
    expect(() => loadEnv({ PORT: 'nao-numerico' })).toThrow();
  });
});
