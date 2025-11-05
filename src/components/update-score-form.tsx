
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { doc, updateDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { z } from "zod";

import type { Player } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { timeStringToSeconds, formatScore } from "@/lib/utils";

interface UpdateScoreFormProps {
  player: Player;
  onFormSubmitted: () => void;
}

export function UpdateScoreForm({ player, onFormSubmitted }: UpdateScoreFormProps) {
  const { toast } = useToast();

  const formSchema = z.object({
    score: z.string()
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
      })
      .refine(val => {
          const newScore = timeStringToSeconds(val);
          return newScore < player.score;
      }, `Score must be lower than the current score of ${formatScore(player.score)}.`)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: "0",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!player.id) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Player ID is missing. Cannot update score.",
        });
        return;
    }
    
    try {
      const playerRef = doc(db, "players", player.id);
      const scoreInSeconds = timeStringToSeconds(data.score);

      await updateDoc(playerRef, {
        score: scoreInSeconds,
      });

      toast({
        title: "Score Updated",
        description: `${player.name} ${player.surname}'s score has been updated to ${formatScore(scoreInSeconds)}.`,
      });
      form.reset();
      onFormSubmitted();
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem updating the score. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">New Score</span>
        </label>
        <input
          type="text"
          placeholder="MMSS"
          className={`input input-bordered ${form.formState.errors.score ? "input-error" : ""}`}
          {...form.register("score")}
        />
        <label className="label">
          <span className="label-text-alt">
            Enter the time as a 4-digit number (e.g., 0827 for 08:27).
          </span>
        </label>
        {form.formState.errors.score && (
          <p className="text-error text-sm mt-1">{form.formState.errors.score.message}</p>
        )}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <span className="loading loading-spinner"></span>
        ) : (
          "Update Score"
        )}
      </button>
    </form>
  );
}
