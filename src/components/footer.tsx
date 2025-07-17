
"use client";

import { useState, useEffect } from "react";
import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, Projector, MessageSquareWarning } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WhatsappLogsView } from "@/components/whatsapp-logs-view";

interface FooterProps {
  players: Player[];
}

export function Footer({ players }: FooterProps) {
  const { user } = useAuth();
  const [hasError, setHasError] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "whatsapp_logs"), where("success", "==", false));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setHasError(!querySnapshot.empty);
    });

    return () => unsubscribe();
  }, [user]);

  const exportToCSV = () => {
    const headers = ["Name", "Surname", "Email", "Phone", "Score"];
    const rows = players.map((player) => [
      player.name,
      player.surname,
      player.email,
      player.phone,
      player.score,
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scoreboard.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openScoreboard = () => {
    window.open("/scoreboard", "_blank");
  };

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Scoreboard Saga. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                <MessageSquareWarning className="mr-2 h-4 w-4" />
                WhatsApp Logs
                {hasError && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>WhatsApp Message Logs</DialogTitle>
                <DialogDescription>
                  A real-time log of all WhatsApp messages sent through the system.
                </DialogDescription>
              </DialogHeader>
              <WhatsappLogsView />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={openScoreboard}>
            <Projector className="mr-2 h-4 w-4" />
            Projector View
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={players.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </div>
    </footer>
  );
}
