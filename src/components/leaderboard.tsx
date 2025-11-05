
"use client";

import type { Player } from "@/lib/types";
import { Medal, TrendingUp, Trash2 } from "lucide-react";
import { formatScore } from "@/lib/utils";
import type { Player } from "@/lib/types";

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
  return <div className="flex h-6 w-6 items-center justify-center font-bold">{rank}.</div>;
};

export function Leaderboard({ players, onUpdateScore, onDeletePlayer, onPlayerClick }: LeaderboardProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Company</th>
            <th>Score</th>
            {onUpdateScore && <th className="text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {players.length > 0 ? (
            players.map((player, index) => {
              const rank = index + 1;
              const isClickable = !!onPlayerClick;
              return (
                <tr
                  key={player.id || player.email}
                  onClick={() => onPlayerClick?.(player)}
                  className={isClickable ? "cursor-pointer hover" : ""}
                >
                  <td>{getRankIndicator(rank)}</td>
                  <td>
                    {player.name} {player.surname}
                  </td>
                  <td>{player.company || "N/A"}</td>
                  <td>
                    <div className="badge badge-primary badge-outline font-mono">
                      {formatScore(player.score)}
                    </div>
                  </td>
                  {onUpdateScore && (
                    <td>
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateScore(player);
                          }}
                        >
                          <TrendingUp className="h-4 w-4" />
                          Update
                        </button>
                        {onDeletePlayer && (
                          <button
                            className="btn btn-sm btn-square btn-error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePlayer(player);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={onUpdateScore ? 5 : 4} className="text-center py-12">
                The leaderboard is empty. Add a player to get started!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

    