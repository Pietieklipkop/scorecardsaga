
"use client";

import type { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, Projector } from "lucide-react";

interface FooterProps {
  players: Player[];
}

export function Footer({ players }: FooterProps) {

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
