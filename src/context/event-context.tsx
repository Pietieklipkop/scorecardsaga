
"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { collection, query, onSnapshot, orderBy, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Event } from "@/lib/types";
import { useSearchParams } from "next/navigation";

interface EventContextType {
    currentEvent: Event | null;
    events: Event[];
    loading: boolean;
    createEvent: (name: string) => Promise<void>;
    switchEvent: (eventId: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// This component contains the client-side logic that uses useSearchParams
function EventProviderContent({ children }: { children: React.ReactNode }) {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error("EventProviderContent must be used within an EventProvider");
    }
    const { events, loading, currentEvent, setCurrentEvent } = context as any;
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!loading && events.length > 0) {
            const eventIdFromUrl = searchParams.get("event");

            if (eventIdFromUrl) {
                const foundEvent = events.find((e: Event) => e.id === eventIdFromUrl);
                if (foundEvent && foundEvent.id !== currentEvent?.id) {
                    setCurrentEvent(foundEvent);
                    localStorage.setItem("scorecardsaga_current_event_id", eventIdFromUrl);
                    return;
                }
            }

            const storedEventId = localStorage.getItem("scorecardsaga_current_event_id");
            if (storedEventId) {
                const foundEvent = events.find((e: Event) => e.id === storedEventId);
                if (foundEvent && foundEvent.id !== currentEvent?.id) {
                    setCurrentEvent(foundEvent);
                    return;
                }
            }
            
            if (!currentEvent) {
                setCurrentEvent(events[0]);
            }
        } else if (!loading && events.length === 0) {
            setCurrentEvent(null);
        }
    }, [loading, events, searchParams, currentEvent, setCurrentEvent]);

    return <>{children}</>;
}


export function EventProvider({ children }: { children: React.ReactNode }) {
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData: Event[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                eventsData.push({
                    id: doc.id,
                    name: data.name,
                    createdAt: data.createdAt?.toDate(),
                    isActive: data.isActive,
                });
            });
            setEvents(eventsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const createEvent = async (name: string) => {
        try {
            const docRef = await addDoc(collection(db, "events"), {
                name,
                createdAt: Timestamp.now(),
                isActive: true,
            });
            switchEvent(docRef.id);
        } catch (error) {
            console.error("Error creating event:", error);
            throw error;
        }
    };

    const switchEvent = (eventId: string) => {
        const event = events.find((e) => e.id === eventId);
        if (event) {
            setCurrentEvent(event);
            localStorage.setItem("scorecardsaga_current_event_id", eventId);
        }
    };

    const value = { currentEvent, events, loading, createEvent, switchEvent, setCurrentEvent };

    return (
        <EventContext.Provider value={value}>
            <EventProviderContent>
                {children}
            </EventProviderContent>
        </EventContext.Provider>
    );
}

export function useEvent() {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error("useEvent must be used within an EventProvider");
    }
    return context;
}
