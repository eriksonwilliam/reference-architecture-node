import { loadEnv } from './infrastructure/config/env';
import { buildContainer } from './infrastructure/config/container';
import { buildServer } from './infrastructure/http/server';

async function main(): Promise<void> {
  const env = loadEnv();
  const { useCases } = buildContainer(env);
  const app = buildServer(useCases, { logger: true });

  await app.listen({ port: env.PORT, host: env.HOST });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
