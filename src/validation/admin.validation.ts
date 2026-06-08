import { z } from "zod";

export const registerAdminSchema = z.object({
  name: z.string().min(2).max(100),

  email: z.email(),

  password: z
    .string()
    .min(8)
    .max(50),
});