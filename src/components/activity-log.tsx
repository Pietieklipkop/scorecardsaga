
"use client";

import type { Player, ActivityLogEntryData } from "@/lib/types";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { History, Medal, UserPlus, ArrowDownCircle, CalendarIcon, UserMinus } from "lucide-react";
import { format, formatDistanceToNow, startOfDay, endOfDay } from "date-fns";
import { formatScore } from "@/lib/utils";
import type { Player, ActivityLogEntryData } from "@/lib/types";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Calendar } from "@/components/ui/calendar";

const PlayerTooltip = ({ player, children }: { player: Omit<Player, 'id'>, children: React.ReactNode }) => (
    <div className="tooltip" data-tip={
        `${player.name} ${player.surname}\n${player.company || ''}\n${player.email}\n${player.phone}\nScore: ${formatScore(player.score)}`
    }>
        {children}
    </div>
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


export function ActivityLog({ onSendWhatsapp }: { onSendWhatsapp?: (dethronedPlayer: Player, newPlayer: Player) => void }) {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<ActivityLogEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (user && selectedDate) {
      setLoading(true);
      const startOfSelectedDay = startOfDay(selectedDate);
      const endOfSelectedDay = endOfDay(selectedDate);

      const q = query(
        collection(db, "activity_logs"), 
        where("timestamp", ">=", Timestamp.fromDate(startOfSelectedDay)),
        where("timestamp", "<=", Timestamp.fromDate(endOfSelectedDay)),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const logsData: ActivityLogEntryData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            logsData.push({ 
                id: doc.id, 
                ...data,
                timestamp: data.timestamp?.toDate() // Convert Firestore Timestamp to Date
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
  }, [user, authLoading, selectedDate]);


  return (
    <div className="card shadow-lg bg-base-100">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <h2 className="card-title">Activity Log</h2>
          </div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm btn-outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
            </label>
            <div tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              />
            </div>
          </div>
        </div>
        <div className="h-96 overflow-y-auto pr-4">
          {loading ? (
            <div className="space-y-4 pt-4">
              <div className="skeleton h-12 w-full"></div>
              <div className="skeleton h-12 w-full"></div>
              <div className="skeleton h-12 w-full"></div>
            </div>
          ) : logs.length > 0 ? (
            <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
              {logs.map((log, index) => (
                <li key={log.id}>
                  <div className="timeline-middle">
                    {getLogIcon(log.type)}
                  </div>
                  <div className={`timeline-${index % 2 === 0 ? 'start' : 'end'} mb-10`}>
                    <time className="font-mono italic text-xs">
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </time>
                    <div className="text-sm">
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
                          {onSendWhatsapp && (
                            <button className="btn btn-xs btn-ghost" onClick={() => onSendWhatsapp(log.oldPlayer as Player, log.newPlayer as Player)}>
                              <WhatsappIcon />
                            </button>
                          )}
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
                  </div>
                  <hr />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-48 items-center justify-center text-center">
              <p>No activity found for {selectedDate ? format(selectedDate, "PPP") : 'the selected date'}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
