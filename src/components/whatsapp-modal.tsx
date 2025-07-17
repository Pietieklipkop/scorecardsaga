
"use client";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface WhatsappModalProps {
    dethronedPlayer: Player;
    dethroningPlayer: Player;
}

export function WhatsappModal({ dethronedPlayer, dethroningPlayer }: WhatsappModalProps) {
    
    const message = `Hi ${dethronedPlayer.name}! Uh oh, looks like ${dethroningPlayer.name} just snatched your spot on the leaderboard with a score of ${dethroningPlayer.score.toLocaleString()}! Don't worry, you can still reclaim your glory. Head back to the game and improve your score!`;

    const handleSend = () => {
        const whatsappUrl = `https://wa.me/${dethronedPlayer.phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                    {message}
                </p>
            </div>
            <p className="text-sm text-muted-foreground">
                Clicking the button will open WhatsApp with the above message pre-filled, ready to send to <span className="font-semibold">{dethronedPlayer.name}</span> at <span className="font-semibold">{dethronedPlayer.phone}</span>.
            </p>
            <Button onClick={handleSend} className="w-full">
                Open WhatsApp
            </Button>
        </div>
    );
}
