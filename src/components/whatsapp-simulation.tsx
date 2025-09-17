
'use client';

import type { WhatsappMessage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WhatsappSimulationProps {
  messages: WhatsappMessage[];
}

export function WhatsappSimulation({ messages }: WhatsappSimulationProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <div>
                <CardTitle>WhatsApp Simulation</CardTitle>
                <CardDescription>A log of messages that would be sent.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Bot className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                        <p className="text-sm font-semibold text-foreground">
                            To: {msg.phone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-[240px] flex-col items-center justify-center text-center">
                <Bot className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  No messages in the queue.
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Trigger a leaderboard change to see messages here.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
