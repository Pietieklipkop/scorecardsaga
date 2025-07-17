"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { AddPlayerForm } from "@/components/add-player-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);


  const handlePlayerAdded = () => {
    setIsDialogOpen(false);
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3 text-center md:text-left">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Scoreboard Saga
            </h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <UserPlus className="mr-2 h-5 w-5" />
              Add New Player
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Register New Player</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new player to the scoreboard.
              </DialogDescription>
            </DialogHeader>
            <AddPlayerForm
              onFormSubmitted={handlePlayerAdded}
            />
          </DialogContent>
        </Dialog>
      </header>
      {loading ? (
        <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Leaderboard players={players} />
      )}
    </main>
  );
}
