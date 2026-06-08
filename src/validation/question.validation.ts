import { z } from "zod";

export const createQuestionSchema = z.object({
  type: z.enum([
    "multiple_choice",
    "short_answer",
    "essay",
  ]),

  content: z.string().min(1),

  options: z.string().optional(),

  answer: z.string().optional(),

  order: z.number().int().positive(),

  examId: z.string().cuid(),
});

export const updateQuestionSchema =
  createQuestionSchema.partial();