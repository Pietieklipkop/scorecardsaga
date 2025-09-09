
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

// For local state management and event detection (not stored in DB)
export type AddLogEntry = {
  id: string;
  type: "add";
  timestamp: Date;
  player: Player;
};

export type DethroneLogEntry = {
  id: string;
  type: "dethrone";
  timestamp: Date;
  newPlayer: Player;
  oldPlayer: Player;
  rank: number;
};

export type ScoreUpdateLogEntry = {
  id: string;
  type: "score_update";
  timestamp: Date;
  player: Player;
  scoreChange: number;
};

export type RemoveLogEntry = {
  id: string;
  type: "remove";
  timestamp: Date;
  player: Player;
};

export type LogEntry = AddLogEntry | DethroneLogEntry | ScoreUpdateLogEntry | RemoveLogEntry;


// Schema for data stored in Firestore `activity_logs` collection
const activityLogPlayerSchema = playerSchema.omit({ id: true, termsAccepted: true }).extend({
    id: z.string(),
});

const addLogDataSchema = z.object({
  type: z.literal("add"),
  player: activityLogPlayerSchema,
});

const dethroneLogDataSchema = z.object({
  type: z.literal("dethrone"),
  newPlayer: activityLogPlayerSchema,
  oldPlayer: activityLogPlayerSchema,
  rank: z.number(),
});

const scoreUpdateLogDataSchema = z.object({
  type: z.literal("score_update"),
  player: activityLogPlayerSchema,
  scoreChange: z.number(),
});

const removeLogDataSchema = z.object({
    type: z.literal("remove"),
    player: activityLogPlayerSchema,
});

const activityLogEntrySchema = z.discriminatedUnion("type", [
  addLogDataSchema,
  dethroneLogDataSchema,
  scoreUpdateLogDataSchema,
  removeLogDataSchema,
]).and(z.object({
  id: z.string().optional(), // Now optional as it's the doc ID
  timestamp: z.date(),
}));

export type ActivityLogEntryData = z.infer<typeof activityLogEntrySchema>;


// Schema for logs managed in client-side state
export const whatsappLogSchema = z.object({
    id: z.string(),
    status: z.enum(['success', 'failure', 'pending']),
    to: z.string(),
    template: z.string(),
    payload: z.any().optional(),
    error: z.string().optional().nullable(),
    timestamp: z.date(),
});

export type WhatsappLog = z.infer<typeof whatsappLogSchema>;
