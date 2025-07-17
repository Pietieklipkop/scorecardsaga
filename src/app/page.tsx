
"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player, LogEntry } from "@/lib/types";
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


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
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
      const q = query(collection(db, "players"), orderBy("score", "desc"));
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
  
    let newLog: LogEntry | null = null;
  
    // Check for a player addition
    if (newPlayers.length > oldPlayers.length) {
      const addedPlayer = newPlayers.find(p => !oldPlayers.some(op => op.id === p.id));
      if (addedPlayer) {
        newLog = {
          id: Date.now().toString(),
          type: "add",
          timestamp: new Date(),
          player: addedPlayer,
        };
      }
    } else if (newPlayers.length === oldPlayers.length) { // Check for score update
      const updatedPlayer = newPlayers.find(np => {
        const op = oldPlayers.find(op => op.id === np.id);
        return op && op.score !== np.score;
      });
  
      if (updatedPlayer) {
        const scoreDiff = updatedPlayer.score - (oldPlayers.find(op => op.id === updatedPlayer.id)?.score || 0);
  
        // Check for dethroning in top 3
        const oldTop3 = oldPlayers.slice(0, 3);
        const newTop3 = newPlayers.slice(0, 3);
  
        // Find if a player in the new top 3 was not in the old top 3 OR has a different rank
        for (let i = 0; i < newTop3.length; i++) {
          const newPlayerAtRank = newTop3[i];
          const oldPlayerAtRank = oldTop3.length > i ? oldTop3[i] : null;
          
          if (newPlayerAtRank.id !== oldPlayerAtRank?.id) {
            // A dethroning or shift happened. The player who was at this rank got pushed down.
            if (oldPlayerAtRank) {
              // We only care if the person who caused the change is the one we're tracking
              if (newPlayerAtRank.id === updatedPlayer.id) {
                newLog = {
                  id: Date.now().toString(),
                  type: "dethrone",
                  timestamp: new Date(),
                  newPlayer: updatedPlayer,
                  oldPlayer: oldPlayerAtRank,
                  rank: i + 1,
                };
                break; // Found our log event, no need to check further
              }
            }
          }
        }
  
        // If no dethroning was logged, it was a simple score update
        if (!newLog) {
          newLog = {
            id: Date.now().toString(),
            type: 'score_update',
            timestamp: new Date(),
            player: updatedPlayer,
            scoreChange: scoreDiff,
          };
        }
      }
    }
  
    if (newLog) {
      setLogs(prevLogs => [newLog!, ...prevLogs].slice(0, 10));
    }
  
    prevPlayersRef.current = newPlayers;
  }, [players, loading, user]);

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
            <ActivityLog logs={logs} onSendWhatsapp={handleSendWhatsappClick} />
          </div>
        </div>
      </main>
      <Footer players={players} />

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Update Score for {selectedPlayer?.name} {selectedPlayer?.surname}</DialogTitle>
            <DialogDescription>
              Enter the new total score for the player. It must be higher than the current score.
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
