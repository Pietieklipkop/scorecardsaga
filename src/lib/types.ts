
import { z } from "zod";

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
});

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

export type LogEntry = AddLogEntry | DethroneLogEntry | ScoreUpdateLogEntry;


// Schema for data stored in Firestore `activity_logs` collection
const activityLogPlayerSchema = playerSchema.omit({ id: true }).extend({
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

const activityLogEntrySchema = z.discriminatedUnion("type", [
  addLogDataSchema,
  dethroneLogDataSchema,
  scoreUpdateLogDataSchema,
]).and(z.object({
  id: z.string().optional(), // Now optional as it's the doc ID
  timestamp: z.date(),
}));

export type ActivityLogEntryData = z.infer<typeof activityLogEntrySchema>;


export const whatsappLogSchema = z.object({
  id: z.string().optional(),
  to: z.string(),
  message: z.string(),
  success: z.boolean(),
  timestamp: z.date(),
  messageId: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
});

export type WhatsappLog = z.infer<typeof whatsappLogSchema>;
