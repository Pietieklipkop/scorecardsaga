
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

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

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
    <footer className="footer footer-center p-4 bg-base-300 text-base-content">
      <div>
        <p>
          &copy; {new Date().getFullYear()} Fairtree. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost" onClick={openScoreboard}>
            <Projector className="mr-2 h-4 w-4" />
            Projector View
          </button>
          <button
            className="btn btn-ghost"
            onClick={exportToCSV}
            disabled={players.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </button>
        </div>
      </div>
    </footer>
  );
}
