
import { z } from "zod";

const timeStringSchema = z.string()
  .min(1, "Score is required")
  .refine(val => /^\d{1,4}$/.test(val), {
    message: "Score must be up to 4 digits representing MMSS.",
  })
  .refine(val => {
    const paddedVal = val.padStart(4, '0');
    const seconds = parseInt(paddedVal.substring(2, 4), 10);
    return seconds < 60;
  }, {
    message: "Seconds part (SS) must be between 00 and 59.",
  });

export const playerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .min(12, "Phone number must be at least 12 characters long.")
    .refine((val) => val.startsWith('+27'), {
        message: "Phone number must start with the country code +27.",
    }),
  score: z.coerce.number().int().min(0, "Score must be a positive number"),
  company: z.string().optional().nullable(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to continue.",
  }),
});

export const addPlayerFormSchema = playerSchema.omit({ score: true }).extend({
    score: timeStringSchema,
});
export type AddPlayerFormData = z.infer<typeof addPlayerFormSchema>;


export type Player = z.infer<typeof playerSchema>;
