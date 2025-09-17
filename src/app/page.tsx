
"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player, WhatsappMessage } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
import { WhatsappSimulation } from "@/components/whatsapp-simulation";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isPlayerDetailsOpen, setIsPlayerDetailsOpen] = useState(false);
  const [playerForDetails, setPlayerForDetails] = useState<Player | null>(null);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsappMessage[]>([]);
  const previousPlayersRef = useRef<Player[]>([]);
  const isInitialLoad = useRef(true);


  const handleUpdateScoreClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateFormSubmitted = () => {
    setIsUpdateDialogOpen(false);
    setSelectedPlayer(null);
  };

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

        if (isInitialLoad.current) {
          isInitialLoad.current = false;
        } else {
          const oldPlayers = previousPlayersRef.current;
          const newPlayers = playersData;

          const oldPlayerMap = new Map(oldPlayers.map((p, i) => [p.id, { ...p, rank: i + 1 }]));
          const newPlayerMap = new Map(newPlayers.map((p, i) => [p.id, { ...p, rank: i + 1 }]));

          const newMessages: WhatsappMessage[] = [];

          // Check for dethronements from top 3
          const oldTop3 = oldPlayers.slice(0, 3);

          oldTop3.forEach((oldPlayer, oldRankIndex) => {
            const oldRank = oldRankIndex + 1;
            const newPlayerData = newPlayerMap.get(oldPlayer.id);

            if (newPlayerData && newPlayerData.rank > oldRank) {
              const newRank = newPlayerData.rank;
               // Find who took their spot
              const dethroner = newPlayers[oldRankIndex];
              const message = {
                id: `${Date.now()}-${oldPlayer.id}`,
                phone: oldPlayer.phone,
                body: `You've been knocked from position ${oldRank} to ${newRank} by ${dethroner?.name ?? 'a new player'}. Your new score to beat is ${dethroner ? dethroner.score : 'N/A'}.`
              };
              newMessages.push(message);
            }
          });
          
          if(newMessages.length > 0) {
            setWhatsappMessages(prev => [...newMessages, ...prev]);
          }

        }
        previousPlayersRef.current = playersData;
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

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
        <div className="flex flex-col gap-8">
          <div className="w-full">
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
          <div className="w-full">
            <WhatsappSimulation messages={whatsappMessages} />
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
