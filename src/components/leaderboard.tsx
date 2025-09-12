
"use client";

import type { Player } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Medal, TrendingUp, Trash2 } from "lucide-react";
import { formatScore } from "@/lib/utils";

interface LeaderboardProps {
  players: Player[];
  onUpdateScore?: (player: Player) => void;
  onDeletePlayer?: (player: Player) => void;
}

const getRankIndicator = (rank: number) => {
  if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
  return <div className="flex h-6 w-6 items-center justify-center font-bold text-white">{rank}.</div>;
};


export function Leaderboard({ players, onUpdateScore, onDeletePlayer }: LeaderboardProps) {
  return (
    <div className="rounded-lg p-4">
       <div className="flex items-center px-4 h-12 text-white font-bold font-raleway border border-[#87B7EE] bg-[#223B4D] rounded-[3px] mb-[5px]">
        <div className="flex-none w-20 text-left">Rank</div>
        <div className="flex-1 text-left">Player</div>
        <div className="flex-1 text-left">Company</div>
        <div className="flex-none w-24 text-left">Score</div>
        {onUpdateScore && <div className="flex-none w-48 text-center">Actions</div>}
      </div>
      
      <div className="space-y-0">
          {players.length > 0 ? (
              players.map((player, index) => {
              const rank = index + 1;
              return (
                  <div 
                      key={player.id || player.email} 
                      className="flex items-center px-4 py-2 transition-colors text-white border border-[#87B7EE] bg-[#223B4D] rounded-[3px]"
                  >
                      <div className="flex-none w-20 flex items-center justify-start">
                          {getRankIndicator(rank)}
                      </div>
                      <div className="flex-1 flex items-center font-raleway text-left">
                          <div className="font-bold">{player.name} {player.surname}</div>
                      </div>
                      <div className="flex-1 font-raleway text-left">
                          {player.company ? (
                              <div className="text-sm">{player.company}</div>
                          ) : (
                              <div className="text-sm text-white/50">N/A</div>
                          )}
                      </div>
                      <div className="flex-none w-24 text-left">
                          <Badge variant="outline" className="text-lg font-bold border-2 border-primary/50 text-white bg-primary/20 font-mono tabular-nums">
                              {formatScore(player.score)}
                          </Badge>
                      </div>
                      {onUpdateScore && (
                          <div className="flex-none w-48 flex justify-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => onUpdateScore(player)} className="text-foreground hover:text-accent-foreground">
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  Update
                              </Button>
                              {onDeletePlayer && (
                                <Button variant="destructive" size="icon" onClick={() => onDeletePlayer(player)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                              )}
                          </div>
                      )}
                  </div>
              );
              })
          ) : (
            <div className="flex items-center justify-center h-48 text-center text-white border border-[#87B7EE] bg-[#223B4D] rounded-[3px]">
                The leaderboard is empty. Add a player to get started!
            </div>
          )}
      </div>
    </div>
  );
}
