import { z } from "zod";

export const createExamSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100),

  description: z
    .string()
    .max(1000)
    .optional(),

  dueDate: z.coerce.date(),

  createdById: z.string().cuid(),
});

export const updateExamSchema = createExamSchema.partial();