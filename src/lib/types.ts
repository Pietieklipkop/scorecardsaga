
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

// Log Entry Types
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

export const whatsappLogSchema = z.object({
  id: z.string().optional(),
  to: z.string(),
  message: z.string(),
  success: z.boolean(),
  timestamp: z.date(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});

export type WhatsappLog = z.infer<typeof whatsappLogSchema>;
