
"use client";

import type { Player, WhatsappLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { sendWhatsappMessage } from "@/ai/flows/send-whatsapp-flow";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";

interface WhatsappModalProps {
    dethronedPlayer: Player;
    dethroningPlayer: Player;
    onMessageSent: (log: WhatsappLog) => void;
}

export function WhatsappModal({ dethronedPlayer, dethroningPlayer, onMessageSent }: WhatsappModalProps) {
    const [isSending, setIsSending] = useState(false);

    const templateName = "competition_entry_leaderboard";

    const handleSend = async () => {
        setIsSending(true);
        let result;
        try {
            result = await sendWhatsappMessage({
                to: dethronedPlayer.phone,
                template: templateName,
            });
        } catch (error: any) {
             result = {
                success: false,
                to: dethronedPlayer.phone,
                template: templateName,
                payload: {},
                error: error.message || "A critical error occurred while executing the flow.",
            };
        } finally {
            const log: WhatsappLog = {
                id: new Date().toISOString(),
                status: result.success ? 'success' : 'failure',
                to: result.to,
                template: result.template,
                payload: result.payload,
                error: result.error,
                timestamp: new Date(),
            };
            onMessageSent(log);
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
