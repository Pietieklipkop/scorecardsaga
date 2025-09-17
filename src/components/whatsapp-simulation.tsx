
"use client";

import type { WhatsappMessage } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhoneOutgoing, MessageSquareText, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface WhatsappSimulationProps {
  messages: WhatsappMessage[];
}

export function WhatsappSimulation({ messages }: WhatsappSimulationProps) {
  
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    // Firestore Timestamps have a toDate() method
    if (timestamp.toDate) {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }
    // Handle JS Date objects or date strings
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>WhatsApp Message Simulation</CardTitle>
        <CardDescription>
          This log shows messages that would be sent when players are dethroned.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <PhoneOutgoing className="h-5 w-5 text-primary" />
                      <p className="text-sm font-semibold text-foreground">
                        To: {message.phone}
                      </p>
                    </div>
                     <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimestamp(message.timestamp)}</span>
                    </div>
                  </div>
                   <div className="flex items-start space-x-3 pl-1">
                    <MessageSquareText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {message.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No messages to send yet.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
