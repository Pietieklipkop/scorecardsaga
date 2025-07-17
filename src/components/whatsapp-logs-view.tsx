
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { WhatsappLog } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
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
import { ScrollArea } from "./ui/scroll-area";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export function WhatsappLogsView() {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<WhatsappLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WhatsappLog | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

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
      }, (error) => {
        console.error("Error fetching whatsapp logs:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!authLoading) {
        setLoading(false);
    }
  }, [user, authLoading]);

  const handleRowClick = (log: WhatsappLog) => {
    if (!log.success && log.error) {
        setSelectedLog(log);
        setIsErrorDialogOpen(true);
    }
  };

  if (loading) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
  }

  return (
    <>
        <ScrollArea className="h-[60vh]">
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
                        <TableRow 
                            key={log.id} 
                            onClick={() => handleRowClick(log)}
                            className={!log.success && log.error ? "cursor-pointer hover:bg-muted/50" : ""}
                        >
                            <TableCell>
                                {log.success ? (
                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Success</Badge>
                                ) : (
                                    <Badge variant="destructive">Failed</Badge>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{log.to}</TableCell>
                            <TableCell>{log.timestamp ? format(log.timestamp, "PPP p") : 'No date'}</TableCell>
                            <TableCell className="max-w-xs truncate">
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
        </ScrollArea>

        <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Error Details</AlertDialogTitle>
                    <AlertDialogDescription>
                        The full error message for the failed WhatsApp message is shown below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="mt-4 bg-muted/80 p-4 rounded-md">
                    <pre className="text-sm text-foreground whitespace-pre-wrap break-words">
                        <code>{selectedLog?.error}</code>
                    </pre>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
