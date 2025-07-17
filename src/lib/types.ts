import { z } from "zod";

export const playerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  score: z.coerce.number().int().min(0, "Score must be a positive number"),
});

export type Player = z.infer<typeof playerSchema>;
