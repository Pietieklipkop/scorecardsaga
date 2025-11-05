
"use client";

import { useState, useEffect } from "react";
import type { WhatsappLog } from "@/lib/types";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

import { MessageSquareText } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { WhatsappLog } from "@/lib/types";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

const StatusBadge = ({ status }: { status: WhatsappLog['status'] }) => {
    switch (status) {
        case 'success':
            return <div className="badge badge-success">Success</div>;
        case 'failure':
            return <div className="badge badge-error">Failure</div>;
        case 'pending':
            return <div className="badge badge-warning">Pending</div>;
        default:
            return <div className="badge badge-ghost">Unknown</div>;
    }
};

export function WhatsappLogViewer() {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<WhatsappLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WhatsappLog | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = query(collection(db, "whatsapp_logs"), orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const logsData: WhatsappLog[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            logsData.push({ 
                id: doc.id, 
                ...data,
                timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
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

  const handleLogClick = (log: WhatsappLog) => {
    setSelectedLog(log);
  };

  return (
    <>
        <div className="card shadow-lg bg-base-100">
            <div className="card-body">
                <div className="flex items-center gap-3">
                    <MessageSquareText className="h-6 w-6 text-primary" />
                    <h2 className="card-title">WhatsApp Logs</h2>
                </div>
                <div className="h-60 overflow-y-auto pr-4">
                    {loading ? (
                        <div className="space-y-4 pt-4">
                            <div className="skeleton h-12 w-full"></div>
                            <div className="skeleton h-12 w-full"></div>
                            <div className="skeleton h-12 w-full"></div>
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="space-y-3">
                            {logs.map((log) => (
                            <div key={log.id} onClick={() => handleLogClick(log)} className="p-3 rounded-md border bg-base-200 hover:bg-base-300 cursor-pointer transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-sm">{log.to}</p>
                                    <StatusBadge status={log.status} />
                                </div>
                                <div className="flex justify-between items-end text-xs">
                                    <span>Template: <span className="font-mono bg-base-300 px-1 py-0.5 rounded">{log.template}</span></span>
                                    <span>{log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true }) : 'No date'}</span>
                                </div>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-center">
                            <p>No WhatsApp messages have been sent yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {selectedLog && (
            <div className="modal modal-open">
                <div className="modal-box w-11/12 max-w-lg">
                    <h3 className="font-bold text-lg">Log Details</h3>
                    <p className="py-2">Detailed information for the WhatsApp message sent to {selectedLog?.to}.</p>
                    <div className="mt-4 space-y-4 text-sm">
                        <div>
                            <h3 className="font-semibold mb-1">Status</h3>
                            <div><StatusBadge status={selectedLog.status} /></div>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-1">Timestamp</h3>
                            <p>{selectedLog.timestamp ? format(selectedLog.timestamp, 'PPP p') : 'N/A'}</p>
                        </div>
                        {selectedLog.error && (
                            <div>
                                <h3 className="font-semibold mb-1 text-error">Error</h3>
                                <p className="font-mono bg-error/10 text-error p-2 rounded-md break-all">{selectedLog.error}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold mb-1">Payload Sent to Twilio</h3>
                            <pre className="bg-base-200 p-2 rounded-md text-xs overflow-auto">
                                {JSON.stringify(selectedLog.payload, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Message Instance</h3>
                            <pre className="bg-base-200 p-2 rounded-md text-xs overflow-auto">
                                {JSON.stringify(selectedLog, null, 2)}
                            </pre>
                        </div>
                    </div>
                    <div className="modal-action">
                        <button className="btn" onClick={() => setSelectedLog(null)}>Close</button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}
