
"use client";

import type { Player, ActivityLogEntryData } from "@/lib/types";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Medal, UserPlus, ArrowDownCircle, UserMinus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatScore } from "@/lib/utils";

const PlayerTooltip = ({ player, children }: { player: Omit<Player, 'id'>, children: React.ReactNode }) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="w-64">
        <div className="flex flex-col space-y-1 p-2">
          <div className="font-bold text-base">{player.name} {player.surname}</div>
          {player.company && <p className="text-sm text-muted-foreground">{player.company}</p>}
          <p className="text-sm text-muted-foreground">{player.email}</p>
          <p className="text-sm text-muted-foreground">{player.phone}</p>
          <p className="text-lg font-bold text-primary mt-2">
            Score: {formatScore(player.score)}
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

const getLogIcon = (type: ActivityLogEntryData['type']) => {
    switch (type) {
        case 'add':
            return <UserPlus className="h-4 w-4 text-primary" />;
        case 'dethrone':
            return <Medal className="h-4 w-4 text-primary" />;
        case 'score_update':
            return <ArrowDownCircle className="h-4 w-4 text-primary" />;
        case 'remove':
            return <UserMinus className="h-4 w-4 text-destructive" />;
        default:
            return null;
    }
}

const WhatsappIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);


export function ActivityLog({ onSendWhatsapp }: { onSendWhatsapp?: (dethronedPlayer: Player, newPlayer: Player | null) => void }) {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<ActivityLogEntryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);

      const q = query(
        collection(db, "activity_logs"), 
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const logsData: ActivityLogEntryData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Firestore Timestamps have a `toDate` method, but JS Dates do not.
            // This handles both cases.
            const timestamp = data.timestamp && typeof data.timestamp.toDate === 'function' 
                ? data.timestamp.toDate() 
                : data.timestamp;
            
            logsData.push({ 
                id: doc.id, 
                ...data,
                timestamp: timestamp
            } as ActivityLogEntryData);
        });
        setLogs(logsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching activity logs:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!authLoading) {
        setLoading(false);
    }
  }, [user, authLoading]);


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <CardTitle>Activity Log</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
            {loading ? (
                 <div className="space-y-4 pt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                 </div>
            ) : logs.length > 0 ? (
                <div className="space-y-6 relative">
                    <div className="absolute left-3.5 top-2 h-full w-0.5 bg-border"></div>
                    {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 z-10">
                            {getLogIcon(log.type)}
                        </div>
                        <div className="flex-1 space-y-1 pt-1">
                            <div className="flex items-center justify-between">
                                <div className="text-sm pr-2">
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
                                    {log.type === 'dethrone' && log.newPlayer && (
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
                                     {log.type === 'dethrone' && !log.newPlayer && (
                                    <>
                                        A new player dethroned{" "}
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
                                            's score improved by{" "}
                                            <span className="font-semibold text-green-600">
                                                {formatScore(log.scoreChange)}
                                            </span>.
                                        </>
                                    )}
                                    {log.type === 'remove' && (
                                        <>
                                            <PlayerTooltip player={log.player}>
                                                <span className="font-semibold text-foreground hover:underline cursor-pointer">
                                                    {log.player.name} {log.player.surname}
                                                </span>
                                            </PlayerTooltip>
                                            {" "}was removed from the leaderboard.
                                        </>
                                    )}
                                </div>
                                {log.type === 'dethrone' && onSendWhatsapp && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onSendWhatsapp(log.oldPlayer as Player, log.newPlayer as Player)}>
                                                    <WhatsappIcon />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Send Whatsapp</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true }) : 'a few moments ago'}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
                    <p>No activity has been logged yet.</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

