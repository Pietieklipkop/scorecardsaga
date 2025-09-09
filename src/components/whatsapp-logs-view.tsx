
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
import { Separator } from "./ui/separator";

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
    setSelectedLog(log);
    setIsErrorDialogOpen(true);
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
                        className="cursor-pointer hover:bg-muted/50"
                    >
                        <TableCell>
                            {log.success ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">Success</Badge>
                            ) : (
                                <Badge variant="destructive">Failed</Badge>
                            )}
                        </TableCell>
                        <TableCell className="font-medium">{log.to}</TableCell>
                        <TableCell>{log.timestamp ? format(log.timestamp, "PPP p") : 'No date'}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.message}</TableCell>
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

        <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
            <AlertDialogContent className="max-w-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Log Details</AlertDialogTitle>
                    <AlertDialogDescription>
                        The full details of the WhatsApp message attempt are shown below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {selectedLog && (
                    <div className="mt-4 text-sm space-y-4">
                        {selectedLog.error && (
                            <div>
                                <h3 className="font-semibold text-destructive mb-2">Error Message</h3>
                                <div className="max-h-40 w-full overflow-y-auto rounded-md border bg-muted/50 p-3">
                                    <pre className="text-destructive whitespace-pre-wrap break-words font-mono">
                                        <code>{selectedLog.error}</code>
                                    </pre>
                                </div>
                            </div>
                        )}
                        {selectedLog.payload && (
                             <div>
                                <h3 className="font-semibold text-foreground mb-2">Twilio Payload</h3>
                                <div className="max-h-60 w-full overflow-y-auto rounded-md border bg-muted/50 p-3">
                                    <pre className="text-foreground whitespace-pre-wrap break-words font-mono">
                                        <code>{JSON.stringify(selectedLog.payload, null, 2)}</code>
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
