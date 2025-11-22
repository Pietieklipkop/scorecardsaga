
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { doc, updateDoc, collection, query, getDocs, orderBy, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { z } from "zod";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { timeStringToHundredths, formatScore } from "@/lib/utils";
import { sendWhatsappMessage } from "@/app/actions/whatsapp";

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
        message: "Score must be up to 4 digits representing SSmm.",
      })
      .refine(val => {
        const paddedVal = val.padStart(4, '0');
        const seconds = parseInt(paddedVal.substring(0, 2), 10);
        return seconds < 60;
      }, {
        message: "Seconds part (SS) must be between 00 and 59.",
      })
      .refine(val => {
        const newScore = timeStringToHundredths(val);
        return newScore < player.score;
      }, `Score must be lower than the current score of ${formatScore(player.score)}.`)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: "0",
    },
  });

  const sendDethroneMessage = async (dethronedPlayer: Player) => {
    const message = `⚡ *Fairtree leaderboard update*

You’ve been challenged and knocked off your spot! 💥 True *excellence* isn’t found at the finish line; it’s in coming back stronger. 

*Join us back at the booth and reclaim your place on the leaderboard.*

_Fairtree. Values-driven Investing._`;
    try {
      // Send via Twilio
      await sendWhatsappMessage(dethronedPlayer.phone, 'leaderboard');

      // Log to Firestore for simulation
      await addDoc(collection(db, "whatsapp_messaging"), {
        phone: dethronedPlayer.phone,
        name: dethronedPlayer.name,
        surname: dethronedPlayer.surname,
        message: message,
        timestamp: new Date(),
        sent: true, // Mark as sent
      });
    } catch (error) {
      console.error("Error sending dethrone message:", error);
    }
  };


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
      const newScoreInHundredths = timeStringToHundredths(data.score);

      // --- Start of proactive notification logic for updates ---
      const playersRef = collection(db, "players");
      const q = query(playersRef, orderBy("score", "asc"));
      const querySnapshot = await getDocs(q);
      const originalPlayers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));

      // Create a hypothetical future leaderboard
      const futurePlayers = originalPlayers
        .map(p => (p.id === player.id ? { ...p, score: newScoreInHundredths } : p))
        .sort((a, b) => a.score - b.score);

      const originalTop3 = originalPlayers.slice(0, 3);

      for (let i = 0; i < originalTop3.length; i++) {
        const originalPlayer = originalTop3[i];
        const originalRank = i;

        // Skip notifying the player being updated
        if (originalPlayer.id === player.id) {
          continue;
        }

        // Find this player's new rank in the future
        const newRank = futurePlayers.findIndex(p => p.id === originalPlayer.id);

        // If the player moved down, send a notification
        if (newRank > originalRank) {
          await sendDethroneMessage(originalPlayer);
        }
      }
      // --- End of proactive notification logic for updates ---

      // Send success/failure message to the updated player
      // Calculate their new rank in the hypothetical future leaderboard
      const updatedPlayerRank = futurePlayers.findIndex(p => p.id === player.id);

      if (updatedPlayerRank < 3) {
        await sendWhatsappMessage(player.phone, 'success');
      } else {
        await sendWhatsappMessage(player.phone, 'failure');
      }

      await updateDoc(playerRef, {
        score: newScoreInHundredths,
        attempts: (player.attempts || 0) + 1,
      });

      toast({
        title: "Score Updated",
        description: `${player.name} ${player.surname}'s score has been updated to ${formatScore(newScoreInHundredths)}.`,
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
                <Input type="text" placeholder="SSmm" {...field} />
              </FormControl>
              <FormDescription>
                Enter the time as a 4-digit number (e.g., 2345 for 23.45s).
              </FormDescription>
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
