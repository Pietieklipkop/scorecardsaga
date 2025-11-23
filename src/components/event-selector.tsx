"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useEvent } from "@/context/event-context";
import { CreateEventDialog } from "./create-event-dialog";
import { EventLinksDialog } from "./event-links-dialog";
import { Share2 } from "lucide-react";

export function EventSelector() {
    const { events, currentEvent, switchEvent } = useEvent();
    const [open, setOpen] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showLinksDialog, setShowLinksDialog] = useState(false);

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                    >
                        {currentEvent ? currentEvent.name : "Select event..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search event..." />
                        <CommandList>
                            <CommandEmpty>No event found.</CommandEmpty>
                            <CommandGroup heading="Events">
                                {events.map((event) => (
                                    <CommandItem
                                        key={event.id}
                                        value={event.name}
                                        onSelect={() => {
                                            switchEvent(event.id);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                currentEvent?.id === event.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {event.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => {
                                        setOpen(false);
                                        setShowLinksDialog(true);
                                    }}
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share Links
                                </CommandItem>
                                <CommandItem
                                    onSelect={() => {
                                        setOpen(false);
                                        setShowCreateDialog(true);
                                    }}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Event
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <CreateEventDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
            <EventLinksDialog open={showLinksDialog} onOpenChange={setShowLinksDialog} />
        </>
    );
}
