
"use client";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { sendWhatsappMessage } from "@/ai/flows/send-whatsapp-flow";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface WhatsappModalProps {
    dethronedPlayer: Player;
    dethroningPlayer: Player;
}

export function WhatsappModal({ dethronedPlayer, dethroningPlayer }: WhatsappModalProps) {
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const message = `Hi ${dethronedPlayer.name}! Uh oh, looks like ${dethroningPlayer.name} just snatched your spot on the leaderboard with a score of ${dethroningPlayer.score.toLocaleString()}! Don't worry, you can still reclaim your glory. Head back to the game and improve your score!`;

    const handleSend = async () => {
        setIsSending(true);
        try {
            const result = await sendWhatsappMessage({
                to: dethronedPlayer.phone,
                message,
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
                description: "Could not send WhatsApp message. Please check the console for details.",
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                    {message}
                </p>
            </div>
            <p className="text-sm text-muted-foreground">
                Clicking the button will send the above message via WhatsApp to <span className="font-semibold">{dethronedPlayer.name}</span> at <span className="font-semibold">{dethronedPlayer.phone}</span>.
            </p>
            <Button onClick={handleSend} className="w-full" disabled={isSending}>
                {isSending ? "Sending..." : "Send WhatsApp Notification"}
            </Button>
        </div>
    );
}
