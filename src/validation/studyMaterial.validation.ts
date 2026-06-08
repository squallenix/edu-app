import { z } from "zod";

export const createStudyMaterialSchema = z.object({
  title: z.string().min(2).max(200),

  subject: z.string().min(2).max(100),

  type: z.enum([
    "pdf",
    "video",
    "note",
    "presentation",
  ]),

  fileUrl: z
    .string()
    .url()
    .optional(),
});

export const updateStudyMaterialSchema =
  createStudyMaterialSchema.partial();