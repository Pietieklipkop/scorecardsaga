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
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Fairtree</a>
      </div>
      <div className="flex-none">
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="btn btn-primary">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Add Player
                </button>
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
            <button className="btn btn-ghost" onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
