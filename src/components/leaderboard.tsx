"use client";

import type { Player } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Medal } from "lucide-react";

interface LeaderboardProps {
  players: Player[];
}

const getRankIndicator = (rank: number) => {
  if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
  return <div className="flex h-6 w-6 items-center justify-center font-bold text-muted-foreground">{rank}</div>;
};


export function Leaderboard({ players }: LeaderboardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.length > 0 ? (
            players.map((player, index) => {
              const rank = index + 1;
              return (
                <TableRow key={player.email} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center">
                        {getRankIndicator(rank)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {player.name.charAt(0)}
                          {player.surname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold">{player.name} {player.surname}</div>
                        <div className="text-sm text-muted-foreground">{player.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-lg font-bold border-2 border-primary/50 text-primary bg-primary/10">
                      {player.score.toLocaleString()}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-48 text-center text-muted-foreground">
                The leaderboard is empty. Add a player to get started!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
