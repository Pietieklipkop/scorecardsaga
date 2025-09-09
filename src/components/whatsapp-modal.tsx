
"use client";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { sendWhatsappMessage } from "@/ai/flows/send-whatsapp-flow";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WhatsappModalProps {
    dethronedPlayer: Player;
    dethroningPlayer: Player;
    onMessageSent: (result: { success: boolean, error?: string }) => void;
}

export function WhatsappModal({ dethronedPlayer, dethroningPlayer, onMessageSent }: WhatsappModalProps) {
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const templateName = "competition_entry_leaderboard";

    const handleSend = async () => {
        setIsSending(true);
        try {
            const result = await sendWhatsappMessage({
                to: dethronedPlayer.phone,
                template: templateName,
            });
            onMessageSent(result);
        } catch (error: any) {
             const result = {
                success: false,
                error: error.message || "A critical error occurred while executing the flow.",
            };
            onMessageSent(result);
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
                <AlertTitle>Important: Template & 24-Hour Window</AlertTitle>
                <AlertDescription>
                    Ensure your template is approved and that the user has messaged your business number within the last 24 hours.
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
