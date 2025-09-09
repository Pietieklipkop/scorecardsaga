
"use client";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { sendWhatsappMessage } from "@/ai/flows/send-whatsapp-flow";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";

interface WhatsappModalProps {
    dethronedPlayer: Player;
    dethroningPlayer: Player;
}

export function WhatsappModal({ dethronedPlayer, dethroningPlayer }: WhatsappModalProps) {
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const templateName = "competition_entry_leaderboard";

    const handleSend = async () => {
        setIsSending(true);
        try {
            const result = await sendWhatsappMessage({
                to: dethronedPlayer.phone,
                template: templateName,
            });

            if (result.success) {
                toast({
                    title: "Message Sent!",
                    description: `A WhatsApp message has been sent to ${dethronedPlayer.name}.`,
                });
            } else {
                throw new Error(result.error || "An unknown error occurred.");
            }
        } catch (error: any) {
            console.error("Failed to send WhatsApp message:", error);
            toast({
                variant: "destructive",
                title: "Error Sending Message",
                description: String(error.message || "Could not send WhatsApp message. Please check logs for details."),
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-4">
                <p className="text-sm font-semibold text-foreground">
                    Template: <span className="font-mono bg-muted px-1 py-0.5 rounded">{templateName}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    This pre-approved template will be sent to {dethronedPlayer.name} to notify them they've been knocked off the leaderboard.
                </p>
            </div>
             <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Important: 24-Hour Window</AlertTitle>
                <AlertDescription>
                    This will only work if <span className="font-bold">{dethronedPlayer.name} ({dethronedPlayer.phone})</span> has messaged your business number within the last 24 hours.
                </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
                Clicking the button will attempt to send the template message via WhatsApp.
            </p>
            <Button onClick={handleSend} className="w-full" disabled={isSending}>
                {isSending ? "Sending..." : "Send Dethrone Notification"}
            </Button>
        </div>
    );
}
