"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

export function EventProvider({ children }: { children: React.ReactNode }) {
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();

    // Load events
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
        });

        return () => unsubscribe();
    }, []);

    // Initialize current event from URL param, localStorage or default to first available
    useEffect(() => {
        if (!loading && events.length > 0) {
            const eventIdFromUrl = searchParams.get("event");

            if (eventIdFromUrl) {
                const foundEvent = events.find((e) => e.id === eventIdFromUrl);
                if (foundEvent) {
                    setCurrentEvent(foundEvent);
                    // Also update local storage so it persists if they navigate away and back without the param
                    localStorage.setItem("scorecardsaga_current_event_id", eventIdFromUrl);
                    return;
                }
            }

            const storedEventId = localStorage.getItem("scorecardsaga_current_event_id");
            if (storedEventId) {
                const foundEvent = events.find((e) => e.id === storedEventId);
                if (foundEvent) {
                    setCurrentEvent(foundEvent);
                    return;
                }
            }
            // If no stored event or stored event not found, default to the most recent one
            // But only if we haven't selected one yet (to avoid overriding user choice on re-renders if logic changes)
            if (!currentEvent) {
                setCurrentEvent(events[0]);
            }
        } else if (!loading && events.length === 0) {
            setCurrentEvent(null);
        }
    }, [loading, events, currentEvent, searchParams]);

    const createEvent = async (name: string) => {
        try {
            const docRef = await addDoc(collection(db, "events"), {
                name,
                createdAt: Timestamp.now(),
                isActive: true,
            });
            // Automatically switch to the new event
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

    return (
        <EventContext.Provider value={{ currentEvent, events, loading, createEvent, switchEvent }}>
            {children}
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
