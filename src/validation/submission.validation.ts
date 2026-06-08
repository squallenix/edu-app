import { z } from "zod";

export const createSubmissionSchema = z.object({
  content: z.string().optional(),

  fileUrl: z
    .string()
    .url()
    .optional(),

  studentId: z.string().cuid(),

  assignmentId: z.string().cuid(),
});

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0).max(100),

  feedback: z.string().optional(),

  gradedById: z.string().cuid(),
});