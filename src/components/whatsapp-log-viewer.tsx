
"use client";

import { useState } from "react";
import type { WhatsappLog } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageSquareText } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const StatusBadge = ({ status }: { status: WhatsappLog['status'] }) => {
    switch (status) {
        case 'success':
            return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Success</Badge>;
        case 'failure':
            return <Badge variant="destructive">Failure</Badge>;
        case 'pending':
            return <Badge variant="secondary">Pending</Badge>;
        default:
            return <Badge variant="outline">Unknown</Badge>;
    }
};

export function WhatsappLogViewer({ logs }: { logs: WhatsappLog[] }) {
  const [selectedLog, setSelectedLog] = useState<WhatsappLog | null>(null);

  const handleLogClick = (log: WhatsappLog) => {
    setSelectedLog(log);
  };

  return (
    <>
        <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
                <MessageSquareText className="h-6 w-6 text-primary" />
                <CardTitle>WhatsApp Logs</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-60 pr-4">
                {logs.length > 0 ? (
                    <div className="space-y-3">
                        {logs.map((log) => (
                        <div key={log.id} onClick={() => handleLogClick(log)} className="p-3 rounded-md border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold text-sm">{log.to}</p>
                                <StatusBadge status={log.status} />
                            </div>
                            <div className="flex justify-between items-end text-xs text-muted-foreground">
                                <span>Template: <span className="font-mono bg-muted px-1 py-0.5 rounded">{log.template}</span></span>
                                <span>{log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true }) : 'No date'}</span>
                            </div>
                        </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-48 items-center justify-center text-center text-muted-foreground">
                        <p>No WhatsApp messages have been sent yet.</p>
                    </div>
                )}
            </ScrollArea>
        </CardContent>
        </Card>

        <Dialog open={!!selectedLog} onOpenChange={(isOpen) => !isOpen && setSelectedLog(null)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Log Details</DialogTitle>
                    <DialogDescription>
                        Detailed information for the WhatsApp message sent to {selectedLog?.to}.
                    </DialogDescription>
                </DialogHeader>
                {selectedLog && (
                    <div className="mt-4 space-y-4 text-sm">
                        <div>
                            <h3 className="font-semibold mb-1">Status</h3>
                            <p><StatusBadge status={selectedLog.status} /></p>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-1">Timestamp</h3>
                            <p>{selectedLog.timestamp ? format(selectedLog.timestamp, 'PPP p') : 'N/A'}</p>
                        </div>
                        {selectedLog.error && (
                            <div>
                                <h3 className="font-semibold mb-1 text-destructive">Error</h3>
                                <p className="font-mono bg-destructive/10 text-destructive p-2 rounded-md break-all">{selectedLog.error}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold mb-1">Payload Sent to Twilio</h3>
                            <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                                {JSON.stringify(selectedLog.payload, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </>
  );
}
