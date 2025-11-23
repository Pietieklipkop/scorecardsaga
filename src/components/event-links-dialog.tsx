"use client";

import { Copy, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEvent } from "@/context/event-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface EventLinksDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EventLinksDialog({ open, onOpenChange }: EventLinksDialogProps) {
    const { currentEvent } = useEvent();
    const { toast } = useToast();
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    if (!currentEvent) return null;

    const projectorLink = `${origin}/scoreboard?event=${currentEvent.id}`;
    const registerLink = `${origin}/add-player?event=${currentEvent.id}`;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `${label} link copied to clipboard.`,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Links for {currentEvent.name}</DialogTitle>
                    <DialogDescription>
                        Use these links to open the specific view for this event.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-4 py-4">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="projector-link" className="sr-only">
                            Projector View Link
                        </Label>
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-1.5">
                                <Label htmlFor="projector-link" className="text-xs font-medium text-muted-foreground">Projector View</Label>
                                <Input
                                    id="projector-link"
                                    defaultValue={projectorLink}
                                    readOnly
                                />
                            </div>
                            <Button type="submit" size="sm" className="px-3 mt-auto" onClick={() => copyToClipboard(projectorLink, "Projector View")}>
                                <span className="sr-only">Copy</span>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="register-link" className="sr-only">
                            Register Player Link
                        </Label>
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-1.5">
                                <Label htmlFor="register-link" className="text-xs font-medium text-muted-foreground">Register Player Page</Label>
                                <Input
                                    id="register-link"
                                    defaultValue={registerLink}
                                    readOnly
                                />
                            </div>
                            <Button type="submit" size="sm" className="px-3 mt-auto" onClick={() => copyToClipboard(registerLink, "Register Player")}>
                                <span className="sr-only">Copy</span>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
