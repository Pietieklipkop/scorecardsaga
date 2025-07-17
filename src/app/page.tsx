"use client";

import { useState } from "react";
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

// Initial dummy data for demonstration
const initialPlayers: Player[] = [
  { name: "Alice", surname: "Smith", email: "alice@example.com", phone: "111-111-1111", score: 1250 },
  { name: "Bob", surname: "Johnson", email: "bob@example.com", phone: "222-222-2222", score: 1100 },
  { name: "Charlie", surname: "Brown", email: "charlie@example.com", phone: "333-333-3333", score: 1080 },
  { name: "Diana", surname: "Prince", email: "diana@example.com", phone: "444-444-4444", score: 950 },
  { name: "Ethan", surname: "Hunt", email: "ethan@example.com", phone: "555-555-5555", score: 800 },
];

export default function Home() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers.sort((a, b) => b.score - a.score));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers, newPlayer];
      return updatedPlayers.sort((a, b) => b.score - a.score);
    });
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
              onPlayerAdd={handleAddPlayer}
              onFormSubmitted={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </header>
      <Leaderboard players={players} />
    </main>
  );
}
