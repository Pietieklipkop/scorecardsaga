
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { doc, updateDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { z } from "zod";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface UpdateScoreFormProps {
  player: Player;
  onFormSubmitted: () => void;
}

export function UpdateScoreForm({ player, onFormSubmitted }: UpdateScoreFormProps) {
  const { toast } = useToast();

  const formSchema = z.object({
    score: z.coerce.number()
        .int()
        .min(player.score + 1, `Score must be higher than the current score of ${player.score.toLocaleString()}.`),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: player.score,
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
      await updateDoc(playerRef, {
        score: data.score,
      });

      toast({
        title: "Score Updated",
        description: `${player.name} ${player.surname}'s score has been updated to ${data.score.toLocaleString()}.`,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Score</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Updating..." : "Update Score"}
        </Button>
      </form>
    </Form>
  );
}
