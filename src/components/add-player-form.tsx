
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { collection, addDoc, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { Player } from "@/lib/types";
import { addPlayerFormSchema, type AddPlayerFormData } from "@/lib/types";
import { useEvent } from "@/context/event-context";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "./ui/checkbox";
import Link from "next/link";
import { timeStringToHundredths } from "@/lib/utils";
import { sendWhatsappMessage } from "@/app/actions/whatsapp";


interface AddPlayerFormProps {
  onFormSubmitted?: () => void;
}

const SOUTH_AFRICAN_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export function AddPlayerForm({ onFormSubmitted }: AddPlayerFormProps) {
  const { toast } = useToast();
  const { currentEvent } = useEvent();
  const form = useForm<AddPlayerFormData>({
    resolver: zodResolver(addPlayerFormSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "+27",
      score: "0",
      company: "",
      region: "",
      termsAccepted: false,
    },
  });

  const sendDethroneMessage = async (player: Player) => {
    const message = `⚡ *Fairtree leaderboard update*

You’ve been challenged and knocked off your spot! 💥 True *excellence* isn’t found at the finish line; it’s in coming back stronger. 

*Join us back at the booth and reclaim your place on the leaderboard.*

_Fairtree. Values-driven Investing._`;
    try {
      // Send via Twilio
      const result = await sendWhatsappMessage(player.phone, 'leaderboard');

      console.log('Sent leaderboard message to:', player.phone, currentEvent);
      // Log to Firestore for simulation
      if (currentEvent) {
        await addDoc(collection(db, "events", currentEvent.id, "whatsapp_messaging"), {
          phone: player.phone,
          name: player.name,
          surname: player.surname,
          message: message,
          timestamp: new Date(),
          sent: result.success,
        });

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to send WhatsApp message.",
          });
        }
      }
    } catch (error) {
      console.error("Error sending dethrone message:", error);
    }
  };


  async function onSubmit(data: AddPlayerFormData) {
    try {
      const { termsAccepted, ...playerData } = data;
      const scoreInHundredths = timeStringToHundredths(data.score);

      const finalPlayerData: Omit<Player, 'id' | 'termsAccepted'> = {
        ...playerData,
        score: scoreInHundredths,
        attempts: 1,
      };

      // --- Start of new proactive notification logic ---
      if (!currentEvent) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No event selected. Please select an event first.",
        });
        return;
      }

      const playersRef = collection(db, "events", currentEvent.id, "players");
      const q = query(playersRef, orderBy("score", "asc"));
      const querySnapshot = await getDocs(q);
      const currentPlayers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));

      const newPlayerPotentialRank = currentPlayers.filter(p => p.score < scoreInHundredths).length;

      // Send success/failure message to the new player
      if (newPlayerPotentialRank < 3) {

        // Success message
        const result = await sendWhatsappMessage(data.phone, 'success');

        const message = `🔥 Fairtree leaderboard update

Well done! 🎉 You’ve made it onto the leaderboard. Consistency is key - let’s see if you can hold your spot and prove your excellence.

Fairtree. Values-driven Investing.`;

        // Log to Firestore for simulation
        if (currentEvent) {
          await addDoc(collection(db, "events", currentEvent.id, "whatsapp_messaging"), {
            phone: data.phone,
            name: data.name,
            surname: data.surname,
            message,
            timestamp: new Date(),
            sent: result.success,
          });
        }

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to send WhatsApp message.",
          });
        }
      } else {
        // Failure message
        const result = await sendWhatsappMessage(data.phone, 'failure');

        const message = `🏃‍ ️ Fairtree fastest hands challenge

Thanks for giving it a go! ⏱️ This time you didn’t make the leaderboard, but remember, excellence isn’t found in a moment, it’s about showing up repeatedly. Try again and see if you can beat your best!

Fairtree. Values-driven Investing.`;

        // Log to Firestore for simulation
        if (currentEvent) {
          await addDoc(collection(db, "events", currentEvent.id, "whatsapp_messaging"), {
            phone: data.phone,
            name: data.name,
            surname: data.surname,
            message,
            timestamp: new Date(),
            sent: result.success,
          });
        }

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to send WhatsApp message.",
          });
        }
      }

      if (newPlayerPotentialRank < 3) {
        const playersToNotify = currentPlayers.slice(newPlayerPotentialRank, 3);
        for (const playerToNotify of playersToNotify) {
          await sendDethroneMessage(playerToNotify);
        }
      }
      // --- End of new proactive notification logic ---


      await addDoc(collection(db, "events", currentEvent.id, "players"), finalPlayerData);

      // Only send to Zapier in production
      if (process.env.NODE_ENV == 'production') {
        // Zapier Webhook
        try {
          await fetch("https://hooks.zapier.com/hooks/catch/22651131/u448d9d/", {
            method: "POST",
            body: JSON.stringify({
              "First Name": data.name,
              "Last Name": data.surname,
              "Email": data.email,
              "Phone Number": data.phone,
              "Company": data.company,
              "Region": data.region,
              "Event Tag": currentEvent.eventTag || "",
            }),
          });
        } catch (webhookError) {
          console.error("Error sending data to Zapier webhook: ", webhookError);
          // We don't want to block the user flow if the webhook fails,
          // so we just log the error and continue.
        }
      } else {
        console.log("Not sending to Zapier in non-production environment");
      }

      toast({
        title: "Player Added",
        description: `${data.name} ${data.surname} has been added to the scoreboard.`,
      });
      form.reset();

      if (onFormSubmitted) {
        onFormSubmitted();
      }

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
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SOUTH_AFRICAN_PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Score</FormLabel>
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
        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Accept terms and conditions
                </FormLabel>
                <FormDescription>
                  You agree to our{" "}
                  <Link href="#" className="underline hover:text-primary">
                    Terms of Service
                  </Link>
                  .
                </FormDescription>
                <FormMessage />
              </div>
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
