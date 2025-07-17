"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddPlayerForm } from "@/components/add-player-form";
import { UserPlus, Trophy, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, logout } = useAuth();

  const handlePlayerAdded = () => {
    setIsDialogOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Scoreboard Saga
          </h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Add Player
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Register New Player</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new player to the scoreboard.
                  </DialogDescription>
                </DialogHeader>
                <AddPlayerForm onFormSubmitted={handlePlayerAdded} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
