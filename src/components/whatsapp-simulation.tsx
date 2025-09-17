
'use client';

import type { WhatsappMessage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';


interface WhatsappSimulationProps {
  messages: WhatsappMessage[];
}

export function WhatsappSimulation({ messages }: WhatsappSimulationProps) {
  const { toast } = useToast();

  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `Phone number ${phone} has been copied.`,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy number to clipboard.",
      });
    });
  };

  const handleSentToggle = async (messageId: string, currentStatus: boolean) => {
    try {
      const messageRef = doc(db, 'whatsapp_messaging', messageId);
      await updateDoc(messageRef, {
        sent: !currentStatus,
      });
    } catch (error) {
      console.error('Error updating message status: ', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update message status.',
      });
    }
  };

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
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                    msg.sent ? "bg-green-100" : "bg-yellow-100"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 shrink-0 mt-1">
                    <Bot className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                                To: {msg.phone}
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(msg.phone)}>
                                <Copy className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Copy phone number</span>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center h-full pl-2">
                    <Checkbox
                      id={`sent-${msg.id}`}
                      checked={!!msg.sent}
                      onCheckedChange={() => handleSentToggle(msg.id, !!msg.sent)}
                      aria-label="Mark as sent"
                    />
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
