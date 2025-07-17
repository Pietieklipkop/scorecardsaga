
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { collection, addDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";

import type { Player } from "@/lib/types";
import { playerSchema } from "@/lib/types";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface AddPlayerFormProps {
  onFormSubmitted: () => void;
}

export function AddPlayerForm({ onFormSubmitted }: AddPlayerFormProps) {
  const { toast } = useToast();
  const form = useForm<Player>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "+27",
      score: 0,
    },
  });

  async function onSubmit(data: Player) {
    try {
      await addDoc(collection(db, "players"), data);
      toast({
        title: "Player Added",
        description: `${data.name} ${data.surname} has been added to the scoreboard.`,
      });
      form.reset();
      onFormSubmitted();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem adding the player. Please try again.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surname</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+27821234567" {...field} />
              </FormControl>
              <FormDescription>
                Must be in international E.164 format (e.g. +27821234567).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Twilio Sandbox Notice</AlertTitle>
          <AlertDescription>
            For a player to receive WhatsApp messages, they must first send the join code to the Twilio Sandbox number.
          </AlertDescription>
        </Alert>
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Score</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add Player to Scoreboard"}
        </Button>
      </form>
    </Form>
  );
}
