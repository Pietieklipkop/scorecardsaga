
"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player, ActivityLogEntryData } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActivityLog } from "@/components/activity-log";
import { WhatsappLogViewer } from "@/components/whatsapp-log-viewer";
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
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlayerDetailsModal } from "@/components/player-details-modal";


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevPlayersRef = useRef<Player[]>([]);

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  
  const [isPlayerDetailsOpen, setIsPlayerDetailsOpen] = useState(false);
  const [playerForDetails, setPlayerForDetails] = useState<Player | null>(null);

  const handleUpdateScoreClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateFormSubmitted = () => {
    setIsUpdateDialogOpen(false);
    setSelectedPlayer(null);
  }

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
    setIsDeleteDialogOpen(true);
  };
  
  const handlePlayerClick = (player: Player) => {
    setPlayerForDetails(player);
    setIsPlayerDetailsOpen(true);
  };

  const confirmDeletePlayer = async () => {
    if (!playerToDelete || !playerToDelete.id) return;
    try {
      await deleteDoc(doc(db, "players", playerToDelete.id));
      toast({
        title: "Player Deleted",
        description: `${playerToDelete.name} ${playerToDelete.surname} has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting player: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete player. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPlayerToDelete(null);
    }
  };

  const sendWhatsappMessage = async (player: Player, template: string) => {
    try {
        const response = await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              to: player.phone,
              template: template,
            }),
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send message');
        }

        toast({
            title: "Message Sent!",
            description: `A '${template}' message was sent to ${player.phone}.`,
        });

    } catch (error: any) {
        console.error("Failed to send WhatsApp message:", error);
        toast({
            variant: "destructive",
            title: "WhatsApp Error",
            description: error.message || `Could not send message to ${player.phone}. Check logs.`,
        });
    }
  };

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
        if (isInitialLoad) {
          prevPlayersRef.current = playersData;
          setLoading(false);
          setIsInitialLoad(false); 
        }
      });

      return () => unsubscribe();
    }
  }, [user, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad || !user) return;
  
    const oldPlayers = prevPlayersRef.current;
    const newPlayers = players;
  
    // Efficiently create maps of player IDs to their ranks (index + 1)
    const oldRanks = new Map(oldPlayers.map((p, i) => [p.id, i + 1]));
    const newRanks = new Map(newPlayers.map((p, i) => [p.id, i + 1]));
  
    // 1. Identify players who were in the top 3 before
    const oldTop3Players = oldPlayers.slice(0, 3);
  
    oldTop3Players.forEach(oldPlayer => {
      if (!oldPlayer.id) return;
  
      const oldRank = oldRanks.get(oldPlayer.id);
      const newRank = newRanks.get(oldPlayer.id);
  
      // If the player is no longer on the board or their rank is now worse than 3rd
      if (oldRank && oldRank <= 3 && (!newRank || newRank > 3)) {

        const dethroningPlayerId = newPlayers[oldRank -1]?.id;
        const dethroningPlayer = newPlayers.find(p => p.id === dethroningPlayerId) ?? null;
  
        // Log the dethronement
        const newLogData: Omit<ActivityLogEntryData, 'timestamp' | 'id'> = {
          type: "dethrone",
          // The dethroning player is whoever took their spot
          newPlayer: dethroningPlayer ? { ...dethroningPlayer, termsAccepted: false } : null,
          oldPlayer: { ...oldPlayer, termsAccepted: false },
          rank: oldRank,
        };
        addDoc(collection(db, "activity_logs"), {
          ...newLogData,
          timestamp: serverTimestamp(),
        });
  
        // Send a WhatsApp message to the dethroned player
        sendWhatsappMessage(oldPlayer, "comp_dethrone");
      }
    });
  
    prevPlayersRef.current = newPlayers;
  }, [players, isInitialLoad, user]);
  

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
              <Leaderboard 
                players={players} 
                onUpdateScore={handleUpdateScoreClick} 
                onDeletePlayer={handleDeleteClick}
                onPlayerClick={handlePlayerClick}
              />
            )}
          </div>
          <div className="lg:w-1/3 space-y-8">
            <ActivityLog />
            <WhatsappLogViewer />
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
      
      <PlayerDetailsModal 
        player={playerForDetails}
        isOpen={isPlayerDetailsOpen}
        onOpenChange={setIsPlayerDetailsOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the player
              <span className="font-semibold"> {playerToDelete?.name} {playerToDelete?.surname}</span> and their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePlayer} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

