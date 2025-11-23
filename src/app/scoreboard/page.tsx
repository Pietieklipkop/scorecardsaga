
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/context/event-context";

export default function ScoreboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentEvent } = useEvent();

  useEffect(() => {
    if (currentEvent) {
      const q = query(collection(db, "events", currentEvent.id, "players"), orderBy("score", "asc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const playersData: Player[] = [];
        querySnapshot.forEach((doc) => {
          playersData.push({ id: doc.id, ...doc.data() } as Player);
        });
        setPlayers(playersData.slice(0, 10)); // Only show top 10
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [currentEvent]);

  return (
    <main
      className="flex-grow flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/TV-BG-01.jpg')" }}
    >
      <div className="container mx-auto px-4 py-8 md:py-12 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-6 p-4 rounded-lg">
          <h1 className="text-3xl font-bold text-white font-raleway">INN8 LEADERBOARD</h1>
          <h2 className="hidden md:block text-5xl font-bold text-white font-recife">Speed Test Challenge</h2>
        </div>
        {loading ? (
          <div className="space-y-4 p-4 rounded-lg">
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
    </main>
  );
}
