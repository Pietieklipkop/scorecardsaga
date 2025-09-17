
'use client';

import { useState } from 'react';
import type { WhatsappMessage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Copy, Mail, Phone, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

  const toggleReadMore = (messageId: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleCopy = (textToCopy: string, successMessage: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: successMessage,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
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
              messages.map((msg) => {
                const isExpanded = expandedMessages[msg.id];
                return (
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
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-semibold text-foreground">
                                    To: {msg.name} {msg.surname}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-mono text-foreground">
                                    {msg.phone}
                                </span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleCopy(msg.phone, `Phone number ${msg.phone} copied.`)}>
                                <Copy className="mr-2" />
                                Copy
                            </Button>
                        </div>
                      
                      <div className="space-y-2 pt-1">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {isExpanded ? msg.message : `${msg.message.substring(0, 80)}...`}
                        </p>
                        <div className="flex justify-between items-center">
                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => toggleReadMore(msg.id)}>
                                {isExpanded ? "Read Less" : "Read More"}
                                {isExpanded ? <ChevronUp className="ml-1" /> : <ChevronDown className="ml-1" />}
                            </Button>
                             <Button variant="outline" size="sm" onClick={() => handleCopy(msg.message, 'Message content copied.')}>
                                <Copy className="mr-2" />
                                Copy
                            </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          <Clock className="h-4 w-4" />
                          <span>
                              Queued: {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                          </span>
                      </div>

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
                )
            })
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
