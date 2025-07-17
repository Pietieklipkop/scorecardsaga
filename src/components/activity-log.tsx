
"use client";

import type { Player, LogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Medal, UserPlus, ArrowUpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PlayerTooltip = ({ player, children }: { player: Player, children: React.ReactNode }) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="w-64">
        <div className="flex flex-col space-y-1 p-2">
          <p className="font-bold text-base">{player.name} {player.surname}</p>
          <p className="text-sm text-muted-foreground">{player.email}</p>
          <p className="text-sm text-muted-foreground">{player.phone}</p>
          <p className="text-lg font-bold text-primary mt-2">
            Score: {player.score.toLocaleString()}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const getRankString = (rank: number) => {
  if (rank === 1) return "1st place";
  if (rank === 2) return "2nd place";
  if (rank === 3) return "3rd place";
  return `${rank}th place`;
}

const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
        case 'add':
            return <UserPlus className="h-4 w-4 text-primary" />;
        case 'dethrone':
            return <Medal className="h-4 w-4 text-primary" />;
        case 'score_update':
            return <ArrowUpCircle className="h-4 w-4 text-primary" />;
        default:
            return null;
    }
}

export function ActivityLog({ logs }: { logs: LogEntry[] }) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center gap-3">
        <History className="h-6 w-6 text-primary" />
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
            {logs.length > 0 ? (
                <div className="space-y-6 relative">
                    <div className="absolute left-3.5 top-2 h-full w-0.5 bg-border"></div>
                    {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 z-10">
                            {getLogIcon(log.type)}
                        </div>
                        <div className="flex-1 space-y-1 pt-1">
                        <p className="text-sm">
                            {log.type === 'add' && (
                            <>
                                <PlayerTooltip player={log.player}>
                                    <span className="font-semibold text-foreground hover:underline cursor-pointer">
                                        {log.player.name} {log.player.surname}
                                    </span>
                                </PlayerTooltip>
                                {" "}was added to the leaderboard.
                            </>
                            )}
                            {log.type === 'dethrone' && (
                            <>
                                <PlayerTooltip player={log.newPlayer}>
                                    <span className="font-semibold text-foreground hover:underline cursor-pointer">
                                        {log.newPlayer.name} {log.newPlayer.surname}
                                    </span>
                                </PlayerTooltip>
                                {" "}dethroned{" "}
                                <PlayerTooltip player={log.oldPlayer}>
                                    <span className="font-semibold text-foreground hover:underline cursor-pointer">
                                        {log.oldPlayer.name} {log.oldPlayer.surname}
                                    </span>
                                </PlayerTooltip>
                                {" "}from {getRankString(log.rank)}.
                            </>
                            )}
                            {log.type === 'score_update' && (
                                <>
                                    <PlayerTooltip player={log.player}>
                                        <span className="font-semibold text-foreground hover:underline cursor-pointer">
                                            {log.player.name} {log.player.surname}
                                        </span>
                                    </PlayerTooltip>
                                    's score increased by{" "}
                                    <span className="font-semibold text-green-600">
                                        {log.scoreChange.toLocaleString()}
                                    </span>.
                                </>
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
                    <p>No activity yet. <br /> Add a player to see the log update!</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
