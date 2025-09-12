
"use client";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";

interface WhatsappModalProps {
    dethronedPlayer: Player;
    dethroningPlayer?: Player | null; // Can be null if dethroned by a new player joining
    onMessageSent: (result: { success: boolean, error?: string }) => void;
}

export function WhatsappModal({ dethronedPlayer, dethroningPlayer, onMessageSent }: WhatsappModalProps) {
    const [isSending, setIsSending] = useState(false);
    
    const handleSend = async () => {
        setIsSending(true);
        try {
            const response = await fetch('/api/send-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    to: dethronedPlayer.phone,
                    template: 'comp_dethrone' 
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send message');
            }
            
            onMessageSent({ success: true });

        } catch (error: any) {
             const result = {
                success: false,
                error: error.message || "A critical error occurred.",
            };
            onMessageSent(result);
        } finally {
            setIsSending(false);
        }
    };
    
    const dethronerName = dethroningPlayer ? `${dethroningPlayer.name} ${dethroningPlayer.surname}` : "a new player";

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-4">
                 <p className="text-sm">
                    Dethroned Player: <span className="font-semibold">{dethronedPlayer.name} {dethronedPlayer.surname}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    A pre-approved template will be sent to notify them they've been knocked off the leaderboard by {dethronerName}.
                </p>
            </div>
             <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Important: Template & 24-Hour Window</AlertTitle>
                <AlertDescription>
                    Ensure your 'comp_dethrone' template is approved and that the user has messaged your business number within the last 24 hours.
                </AlertDescription>
            </Alert>
            <Button onClick={handleSend} className="w-full" disabled={isSending}>
                {isSending ? "Sending..." : "Send Dethrone Notification"}
            </Button>
        </div>
    );
}

    