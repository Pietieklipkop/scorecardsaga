
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
import { Button } from "@/components/ui/button";
import { Medal, TrendingUp } from "lucide-react";
import { formatScore } from "@/lib/utils";

interface LeaderboardProps {
  players: Player[];
  onUpdateScore?: (player: Player) => void;
}

const getRankIndicator = (rank: number) => {
  if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
  return <div className="flex h-6 w-6 items-center justify-center font-bold text-muted-foreground">{rank}</div>;
};


export function Leaderboard({ players, onUpdateScore }: LeaderboardProps) {
  return (
    <div className="space-y-1">
       <div className="flex items-center px-4 h-12 rounded-sm border border-[#718CA9] bg-[#718CA9]/60 text-white font-bold text-sm">
        <div className="w-[80px] text-center">Rank</div>
        <div className="flex-1">Player</div>
        <div className="flex-1">Company</div>
        <div className="flex-1 text-right">Score</div>
        {onUpdateScore && <div className="w-[150px] text-center">Actions</div>}
      </div>
      <div className="bg-card text-card-foreground">
        <Table>
            <TableBody>
            {players.length > 0 ? (
                players.map((player, index) => {
                const rank = index + 1;
                return (
                    <TableRow 
                        key={player.id || player.email} 
                        className="transition-colors border border-[#718CA9] bg-[#718CA9]/60 text-white hover:bg-[#718CA9]/80 rounded-sm"
                    >
                    <TableCell className="font-medium w-[80px]">
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
                        <div className="font-bold">{player.name} {player.surname}</div>
                        </div>
                    </TableCell>
                    <TableCell>
                        {player.company ? (
                        <div className="text-sm">{player.company}</div>
                        ) : (
                        <div className="text-sm text-white/50">N/A</div>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        <Badge variant="outline" className="text-lg font-bold border-2 border-primary/50 text-primary bg-primary/10">
                        {formatScore(player.score)}
                        </Badge>
                    </TableCell>
                    {onUpdateScore && (
                        <TableCell className="text-center w-[150px]">
                        <Button variant="outline" size="sm" onClick={() => onUpdateScore(player)}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Update
                        </Button>
                        </TableCell>
                    )}
                    </TableRow>
                );
                })
            ) : (
                <TableRow>
                <TableCell colSpan={onUpdateScore ? 5 : 4} className="h-48 text-center text-muted-foreground">
                    The leaderboard is empty. Add a player to get started!
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
