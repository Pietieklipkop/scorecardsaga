
"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player, LogEntry, ActivityLogEntryData } from "@/lib/types";
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
import { WhatsappModal } from "@/components/whatsapp-modal";
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  const [isConfirmWhatsappOpen, setIsConfirmWhatsappOpen] = useState(false);
  const [playerForWhatsapp, setPlayerForWhatsapp] = useState<Player | null>(null);

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

  const handleSendWhatsappClick = (dethronedPlayer: Player, newPlayer: Player) => {
    setDethronedPlayer(dethronedPlayer);
    setDethroningPlayer(newPlayer);
    setIsWhatsappDialogOpen(true);
  }
  
  const handleMessageSent = (result: { success: boolean, to?: string, error?: string }) => {
    if (result.success) {
      toast({
        title: "Message Sent!",
        description: `A welcome message was sent to ${result.to}.`,
      });
    } else {
       toast({
        variant: "destructive",
        title: "WhatsApp Error",
        description: `Could not send message to ${result.to}. Check logs.`,
      });
    }
  };

  const handleConfirmAndSend = async () => {
    if (!playerForWhatsapp) return;

    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: playerForWhatsapp.phone }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      toast({
        title: "Message Sent!",
        description: `A welcome message was sent to ${playerForWhatsapp.phone}.`,
      });

    } catch (error: any) {
      console.error("Failed to send welcome WhatsApp message:", error);
      toast({
        variant: "destructive",
        title: "WhatsApp Error",
        description: error.message || `Could not send message. Check logs.`,
      });
    }
    
    setIsConfirmWhatsappOpen(false);
    setPlayerForWhatsapp(null);
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
    const createPlayerLogObject = (player: Player) => ({
      id: player.id!,
      name: player.name,
      surname: player.surname,
      email: player.email,
      phone: player.phone,
      score: player.score,
      company: player.company || null,
    });
  
    // Check for a player addition
    if (newPlayers.length > oldPlayers.length) {
      const addedPlayer = newPlayers.find(p => !oldPlayers.some(op => op.id === p.id));
      if (addedPlayer) {
        newLogData = {
          type: "add",
          player: createPlayerLogObject(addedPlayer),
        };
        
        setPlayerForWhatsapp(addedPlayer);
        setIsConfirmWhatsappOpen(true);
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
                newPlayer: createPlayerLogObject(updatedPlayer),
                oldPlayer: createPlayerLogObject(oldPlayerAtRank as Player),
                rank: i + 1,
              };
              break; 
            }
          }
        }
  
        if (!newLogData) {
          newLogData = {
            type: 'score_update',
            player: createPlayerLogObject(updatedPlayer),
            scoreChange: scoreDiff,
          };
        }
      }
    } else if (newPlayers.length < oldPlayers.length) { // Check for player removal
      const removedPlayer = oldPlayers.find(p => !newPlayers.some(np => np.id === p.id));
      if (removedPlayer) {
        newLogData = {
          type: "remove",
          player: createPlayerLogObject(removedPlayer),
        };
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

  const PAYLOAD_STRUCTURE = {
    contentSid: 'HX0ec6a7dd8adf7f5b3de2058944dc4fff',
    from: `whatsapp:${process.env.NEXT_PUBLIC_TWILIO_SENDER_NUMBER || "+15558511306"}`,
    to: `whatsapp:${playerForWhatsapp?.phone}`,
  };

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
              <Leaderboard players={players} onUpdateScore={handleUpdateScoreClick} onDeletePlayer={handleDeleteClick} />
            )}
          </div>
          <div className="lg:w-1/3 space-y-8">
            <ActivityLog onSendWhatsapp={handleSendWhatsappClick} />
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

      <Dialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Send Dethrone Notification</DialogTitle>
             <DialogDescription>
              A pre-approved template message will be sent to the dethroned player.
            </DialogDescription>
          </DialogHeader>
          {dethronedPlayer && dethroningPlayer && (
            <WhatsappModal 
                dethronedPlayer={dethronedPlayer} 
                dethroningPlayer={dethroningPlayer}
                onMessageSent={(result) => handleMessageSent({ ...result, to: dethronedPlayer.phone })}
            />
          )}
        </DialogContent>
      </Dialog>

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

      <AlertDialog open={isConfirmWhatsappOpen} onOpenChange={setIsConfirmWhatsappOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm WhatsApp Message</AlertDialogTitle>
            <AlertDialogDescription>
              A request will be sent to Twilio to send a WhatsApp message. Please review the details below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">API Endpoint</h3>
              <p className="font-mono bg-muted p-2 rounded-md break-all text-xs">POST https://api.twilio.com/2010-04-01/Accounts/[AccountSid]/Messages.json</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Payload</h3>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                  {JSON.stringify(PAYLOAD_STRUCTURE, null, 2)}
              </pre>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlayerForWhatsapp(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAndSend}>
              Confirm & Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
