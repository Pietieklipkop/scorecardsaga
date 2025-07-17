
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WhatsappLog } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react";


export default function WhatsappLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<WhatsappLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "whatsapp_logs"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const logsData: WhatsappLog[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            logsData.push({ 
                id: doc.id, 
                ...data,
                timestamp: data.timestamp?.toDate() // Convert Firestore Timestamp to Date
            } as WhatsappLog);
        });
        setLogs(logsData);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></div>
          <span className="text-lg text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <div className="space-y-4 mb-8">
            <h1 className="text-3xl font-bold">WhatsApp Message Logs</h1>
            <p className="text-muted-foreground">
                A real-time log of all WhatsApp messages sent through the system.
            </p>
        </div>
        
        {loading ? (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {logs.length > 0 ? (
                        logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>
                                {log.success ? (
                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Success</Badge>
                                ) : (
                                    <Badge variant="destructive">Failed</Badge>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{log.to}</TableCell>
                            <TableCell>{log.timestamp ? format(log.timestamp, "PPP p") : 'No date'}</TableCell>
                            <TableCell className="max-w-md truncate">
                                {log.success ? `SID: ${log.messageId}` : log.error}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                           No WhatsApp messages have been sent yet.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        )}
      </main>
    </>
  );
}
