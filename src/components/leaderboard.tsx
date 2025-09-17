
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
  onPlayerClick?: (player: Player) => void;
}

const getRankIndicator = (rank: number) => {
  if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
  return <div className="flex h-6 w-6 items-center justify-center font-bold text-white">{rank}.</div>;
};


export function Leaderboard({ players, onUpdateScore, onDeletePlayer, onPlayerClick }: LeaderboardProps) {
  const isAdminView = !!onUpdateScore;

  return (
    <div className="rounded-lg p-4">
       <div className="flex items-center px-4 h-12 text-white border border-[#87B7EE] bg-[#223B4D] rounded-[3px] mb-[5px]">
        <div className="flex-none w-20 text-left font-raleway font-bold">Rank</div>
        <div className="flex-1 text-left font-raleway font-bold">Player</div>
        <div className="flex-1 text-left font-raleway font-bold">Company</div>
        <div className="flex-none w-[7rem] text-center font-raleway font-bold">Score</div>
        {isAdminView && <div className="flex-none w-20 text-center font-raleway font-bold">Attempts</div>}
        {isAdminView && <div className="flex-none w-48 text-center">Actions</div>}
      </div>
      
      <div className="space-y-0">
          {players.length > 0 ? (
              players.map((player, index) => {
              const rank = index + 1;
              const isClickable = !!onPlayerClick;
              return (
                  <div 
                      key={player.id || player.email} 
                      onClick={() => onPlayerClick?.(player)}
                      className={`flex items-center px-4 py-2 transition-colors text-white border border-[#87B7EE] bg-[#223B4D] rounded-[3px] ${isClickable ? 'cursor-pointer hover:bg-[#2c4c64]' : ''}`}
                  >
                      <div className="flex-none w-20 flex items-center justify-start">
                          {getRankIndicator(rank)}
                      </div>
                      <div className="flex-1 flex items-center font-raleway text-left">
                          <div>{player.name} {player.surname}</div>
                      </div>
                      <div className="flex-1 font-raleway text-left">
                          {player.company ? (
                              <div className="text-sm">{player.company}</div>
                          ) : (
                              <div className="text-sm text-white/50">N/A</div>
                          )}
                      </div>
                      <div className="flex-none w-[7rem] flex justify-center">
                          <Badge variant="outline" className="text-lg font-bold border-2 border-primary/50 text-white bg-primary/20 font-mono tabular-nums">
                              {formatScore(player.score)}
                          </Badge>
                      </div>
                      {isAdminView && (
                          <div className="flex-none w-20 flex justify-center">
                              <span className="font-mono text-lg font-bold">{player.attempts ?? 1}</span>
                          </div>
                      )}
                      {isAdminView && (
                          <div className="flex-none w-48 flex justify-center gap-2">
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onUpdateScore?.(player); }} className="text-foreground hover:text-accent-foreground">
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  Update
                              </Button>
                              {onDeletePlayer && (
                                <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDeletePlayer(player); }}>
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
