
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScoreboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "players"), orderBy("score", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const playersData: Player[] = [];
      querySnapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player);
      });
      setPlayers(playersData.slice(0, 10)); // Only show top 10
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 flex-grow bg-background flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground font-raleway">INN8 LEADERBOARD</h1>
            <h2 className="text-5xl font-bold text-foreground font-recife">Speed Test Challenge</h2>
        </div>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Leaderboard players={players} />
      )}
    </main>
  );
}
