import { z } from 'zod';

export const createTaskBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const taskIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type TaskIdParams = z.infer<typeof taskIdParamsSchema>;
