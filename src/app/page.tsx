"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Player } from "@/lib/types";
import { Leaderboard } from "@/components/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";


export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
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
      </main>
      <Footer players={players} />
    </>
  );
}
