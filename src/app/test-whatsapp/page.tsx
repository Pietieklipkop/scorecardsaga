'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { sendWhatsappMessage } from '@/app/actions/whatsapp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestWhatsappPage() {
    const { toast } = useToast();
    const [phone, setPhone] = useState('+27');
    const [template, setTemplate] = useState<'success' | 'failure' | 'leaderboard'>('success');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!phone) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please enter a phone number.',
            });
            return;
        }

        setLoading(true);
        try {
            const result = await sendWhatsappMessage(phone, template);

            if (result.success) {
                toast({
                    title: 'Message Sent',
                    description: `Successfully sent ${template} template to ${phone}. SID: ${result.messageSid}`,
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Send Failed',
                    description: result.error || 'Unknown error occurred.',
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'An unexpected error occurred.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>WhatsApp Template Tester</CardTitle>
                    <CardDescription>
                        Send test messages without affecting the leaderboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+27..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Must be in E.164 format (e.g. +2782...)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Template Type</Label>
                        <RadioGroup
                            value={template}
                            onValueChange={(val) => setTemplate(val as any)}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="success" id="success" />
                                <Label htmlFor="success">Success (Top 3)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="failure" id="failure" />
                                <Label htmlFor="failure">Failure (Not Top 3)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="leaderboard" id="leaderboard" />
                                <Label htmlFor="leaderboard">Leaderboard (Dethrone)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button onClick={handleSend} disabled={loading} className="w-full">
                        {loading ? 'Sending...' : 'Send Test Message'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
