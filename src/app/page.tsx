
"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player, LogEntry, ActivityLogEntryData } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActivityLog } from "@/components/activity-log";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpdateScoreForm } from "@/components/update-score-form";
import { WhatsappModal } from "@/components/whatsapp-modal";
import { sendWhatsappMessage } from "@/ai/flows/send-whatsapp-flow";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const prevPlayersRef = useRef<Player[]>([]);

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);
  const [dethronedPlayer, setDethronedPlayer] = useState<Player | null>(null);
  const [dethroningPlayer, setDethroningPlayer] = useState<Player | null>(null);

  const handleUpdateScoreClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateFormSubmitted = () => {
    setIsUpdateDialogOpen(false);
    setSelectedPlayer(null);
  }

  const handleSendWhatsappClick = (dethronedPlayer: Player, newPlayer: Player) => {
    setDethronedPlayer(dethronedPlayer);
    setDethroningPlayer(newPlayer);
    setIsWhatsappDialogOpen(true);
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "players"), orderBy("score", "asc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const playersData: Player[] = [];
        querySnapshot.forEach((doc) => {
          playersData.push({ id: doc.id, ...doc.data() } as Player);
        });
        setPlayers(playersData);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;
  
    const oldPlayers = prevPlayersRef.current;
    const newPlayers = players;
  
    if (oldPlayers.length === 0) {
      prevPlayersRef.current = newPlayers;
      return;
    }
  
    let newLogData: Omit<ActivityLogEntryData, 'timestamp' | 'id'> | null = null;
  
    // Check for a player addition
    if (newPlayers.length > oldPlayers.length) {
      const addedPlayer = newPlayers.find(p => !oldPlayers.some(op => op.id === p.id));
      if (addedPlayer) {
        newLogData = {
          type: "add",
          player: { id: addedPlayer.id!, name: addedPlayer.name, surname: addedPlayer.surname, email: addedPlayer.email, phone: addedPlayer.phone, score: addedPlayer.score, company: addedPlayer.company },
        };

        // Send WhatsApp message on player addition
        sendWhatsappMessage({
          to: addedPlayer.phone,
          message: `Welcome to the Scoreboard Saga, ${addedPlayer.name}! Your score has been added.`
        }).then(result => {
          if (result.success) {
            toast({
              title: "Welcome Message Sent",
              description: `A WhatsApp message has been sent to ${addedPlayer.name}.`,
            });
          } else {
            throw new Error(result.error || "An unknown error occurred while sending welcome message.");
          }
        }).catch(error => {
          console.error("Failed to send welcome WhatsApp message:", error);
            toast({
                variant: "destructive",
                title: "Error Sending Welcome Message",
                description: String(error.message || "Could not send welcome message. Please check logs for details."),
            });
        });
      }
    } else if (newPlayers.length === oldPlayers.length) { // Check for score update
      const updatedPlayer = newPlayers.find(np => {
        const op = oldPlayers.find(op => op.id === np.id);
        return op && op.score !== np.score;
      });
  
      if (updatedPlayer) {
        const scoreDiff = (oldPlayers.find(op => op.id === updatedPlayer.id)?.score || 0) - updatedPlayer.score;
  
        // Check for dethroning in top 3
        const oldTop3 = oldPlayers.slice(0, 3);
        const newTop3 = newPlayers.slice(0, 3);
  
        for (let i = 0; i < newTop3.length; i++) {
          const newPlayerAtRank = newTop3[i];
          const oldPlayerAtRank = oldTop3.length > i ? oldTop3[i] : null;
          
          if (newPlayerAtRank.id !== oldPlayerAtRank?.id) {
            if (oldPlayerAtRank && newPlayerAtRank.id === updatedPlayer.id) {
              newLogData = {
                type: "dethrone",
                newPlayer: { id: updatedPlayer.id!, name: updatedPlayer.name, surname: updatedPlayer.surname, email: updatedPlayer.email, phone: updatedPlayer.phone, score: updatedPlayer.score, company: updatedPlayer.company },
                oldPlayer: { id: oldPlayerAtRank.id!, name: oldPlayerAtRank.name, surname: oldPlayerAtRank.surname, email: oldPlayerAtRank.email, phone: oldPlayerAtRank.phone, score: oldPlayerAtRank.score, company: oldPlayerAtRank.company },
                rank: i + 1,
              };
              break; 
            }
          }
        }
  
        if (!newLogData) {
          newLogData = {
            type: 'score_update',
            player: { id: updatedPlayer.id!, name: updatedPlayer.name, surname: updatedPlayer.surname, email: updatedPlayer.email, phone: updatedPlayer.phone, score: updatedPlayer.score, company: updatedPlayer.company },
            scoreChange: scoreDiff,
          };
        }
      }
    }
  
    if (newLogData) {
      addDoc(collection(db, "activity_logs"), {
        ...newLogData,
        timestamp: serverTimestamp(),
      });
    }
  
    prevPlayersRef.current = newPlayers;
  }, [players, loading, user, toast]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></div>
          <span className="text-lg text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {loading ? (
              <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Leaderboard players={players} onUpdateScore={handleUpdateScoreClick} />
            )}
          </div>
          <div className="lg:w-1/3">
            <ActivityLog onSendWhatsapp={handleSendWhatsappClick} />
          </div>
        </div>
      </main>
      <Footer players={players} />

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Update Score for {selectedPlayer?.name} {selectedPlayer?.surname}</DialogTitle>
            <DialogDescription>
              Enter the new total score for the player. It must be lower than the current score.
            </DialogDescription>
          </DialogHeader>
          {selectedPlayer && <UpdateScoreForm player={selectedPlayer} onFormSubmitted={handleUpdateFormSubmitted} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Notification</DialogTitle>
             <DialogDescription>
              A message will be prepared to inform the dethroned player.
            </DialogDescription>
          </DialogHeader>
          {dethronedPlayer && dethroningPlayer && (
            <WhatsappModal dethronedPlayer={dethronedPlayer} dethroningPlayer={dethroningPlayer} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
