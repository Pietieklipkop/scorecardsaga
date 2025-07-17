"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player, LogEntry } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ActivityLog } from "@/components/activity-log";
import { diff } from "deep-object-diff";


export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const prevPlayersRef = useRef<Player[]>([]);

  useEffect(() => {
    const q = query(collection(db, "players"), orderBy("score", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const playersData: Player[] = [];
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player);
      });
      setPlayers(playersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const oldPlayers = prevPlayersRef.current;
    const newPlayers = players;

    if (oldPlayers.length > 0 && newPlayers.length > oldPlayers.length) {
      const addedPlayer = newPlayers.find(p => !oldPlayers.some(op => op.id === p.id));
      
      if (addedPlayer) {
        const newRank = newPlayers.findIndex(p => p.id === addedPlayer.id) + 1;
        
        let newLog: LogEntry | null = null;
        
        if (newRank >= 1 && newRank <= 3) {
          const oldPlayerAtRank = oldPlayers[newRank - 1];
          if (oldPlayerAtRank && oldPlayerAtRank.id !== addedPlayer.id) {
            newLog = {
              id: Date.now().toString(),
              type: "dethrone",
              timestamp: new Date(),
              newPlayer: addedPlayer,
              oldPlayer: oldPlayerAtRank,
              rank: newRank,
            };
          }
        }
        
        if (!newLog) {
          newLog = {
            id: Date.now().toString(),
            type: "add",
            timestamp: new Date(),
            player: addedPlayer,
          };
        }

        setLogs(prevLogs => [newLog!, ...prevLogs].slice(0, 10));
      }
    }

    prevPlayersRef.current = newPlayers;
  }, [players, loading]);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {loading ? (
              <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Leaderboard players={players} />
            )}
          </div>
          <div className="lg:w-1/3">
            <ActivityLog logs={logs} />
          </div>
        </div>
      </main>
      <Footer players={players} />
    </>
  );
}
