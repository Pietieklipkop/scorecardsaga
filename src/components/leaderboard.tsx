
"use client";

import type { Player } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
    <div>
       <div className="flex items-center px-4 h-12 rounded-sm border border-[#718CA9] bg-[#718CA9]/60 text-white font-bold text-sm">
        <div className="w-[80px] flex-shrink-0 text-center">Rank</div>
        <div className="flex-1">Player</div>
        <div className="flex-1">Company</div>
        <div className="flex-1 text-right">Score</div>
        {onUpdateScore && <div className="w-[150px] flex-shrink-0 text-center">Actions</div>}
      </div>
      
      <div className="mt-2.5">
          {players.length > 0 ? (
              players.map((player, index) => {
              const rank = index + 1;
              return (
                  <div 
                      key={player.id || player.email} 
                      className="flex items-center px-4 py-2 transition-colors border border-[#718CA9] bg-[#718CA9]/60 text-white hover:bg-[#718CA9]/80 rounded-sm"
                  >
                      <div className="w-[80px] flex-shrink-0 flex items-center justify-center">
                          {getRankIndicator(rank)}
                      </div>
                      <div className="flex-1 flex items-center">
                          <div className="font-bold">{player.name} {player.surname}</div>
                      </div>
                      <div className="flex-1">
                          {player.company ? (
                              <div className="text-sm">{player.company}</div>
                          ) : (
                              <div className="text-sm text-white/50">N/A</div>
                          )}
                      </div>
                      <div className="flex-1 text-right">
                          <Badge variant="outline" className="text-lg font-bold border-2 border-primary/50 text-primary bg-primary/10">
                              {formatScore(player.score)}
                          </Badge>
                      </div>
                      {onUpdateScore && (
                          <div className="w-[150px] flex-shrink-0 text-center">
                              <Button variant="outline" size="sm" onClick={() => onUpdateScore(player)}>
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  Update
                              </Button>
                          </div>
                      )}
                  </div>
              );
              })
          ) : (
            <div className="flex items-center justify-center h-48 text-center text-muted-foreground bg-card rounded-sm">
                The leaderboard is empty. Add a player to get started!
            </div>
          )}
      </div>
    </div>
  );
}
