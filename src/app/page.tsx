
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player, WhatsappMessage } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useEvent } from "@/context/event-context";
import { EventSelector } from "@/components/event-selector";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { currentEvent, loading: eventLoading } = useEvent();
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
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(true);


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
    if (!playerToDelete || !playerToDelete.id || !currentEvent) return;
    try {
      await deleteDoc(doc(db, "events", currentEvent.id, "players", playerToDelete.id));
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
    if (user && currentEvent) {
      const qPlayers = query(collection(db, "events", currentEvent.id, "players"), orderBy("score", "asc"));
      const unsubscribePlayers = onSnapshot(qPlayers, (querySnapshot) => {
        const playersData: Player[] = [];
        querySnapshot.forEach((doc) => {
          playersData.push({ id: doc.id, ...doc.data() } as Player);
        });
        setPlayers(playersData);
        setLoading(false);
      });

      const qWhatsapp = query(collection(db, "events", currentEvent.id, "whatsapp_messaging"), orderBy("timestamp", "desc"));
      const unsubscribeWhatsapp = onSnapshot(qWhatsapp, (querySnapshot) => {
        const messagesData: WhatsappMessage[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() // Convert Firestore Timestamp to JS Date
          } as WhatsappMessage);
        });
        setWhatsappMessages(messagesData);
      });

      return () => {
        unsubscribePlayers();
        unsubscribeWhatsapp();
      };
    } else if (user && !currentEvent && !eventLoading) {
      setPlayers([]);
      setWhatsappMessages([]);
      setLoading(false);
    }
  }, [user, currentEvent, eventLoading]);

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
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <EventSelector />
      </div>
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
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
        <div className="mt-12">
          <Collapsible
            open={isWhatsappOpen}
            onOpenChange={setIsWhatsappOpen}
          >
            <WhatsappSimulation
              messages={whatsappMessages}
              collapsibleTrigger={
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              }
              collapsibleContentWrapper={(children) => <CollapsibleContent>{children}</CollapsibleContent>}
            />
          </Collapsible>
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
