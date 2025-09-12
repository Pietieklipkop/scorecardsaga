import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './page';
import * as firestore from 'firebase/firestore';
import * as nextRouter from 'next/navigation';
import * as useAuth from '@/hooks/use-auth';

// Mock external dependencies
vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        orderBy: vi.fn(),
        onSnapshot: vi.fn(),
        addDoc: vi.fn(),
        serverTimestamp: vi.fn(() => 'mock-timestamp'),
    };
});

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

// Mock components that are not relevant to the test
vi.mock('@/components/header', () => ({ Header: () => <div>Header</div> }));
vi.mock('@/components/footer', () => ({ Footer: () => <div>Footer</div> }));
vi.mock('@/components/activity-log', () => ({ ActivityLog: () => <div>Activity Log</div> }));
vi.mock('@/components/whatsapp-log-viewer', () => ({ WhatsappLogViewer: () => <div>Whatsapp Log Viewer</div> }));


describe('Home component - Activity Logging', () => {
    let onSnapshotCallback: ((snapshot: any) => void) | null = null;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock for useAuth
        (useAuth.useAuth as vi.Mock).mockReturnValue({
            user: { uid: 'test-user' },
            loading: false,
        });

        // Setup mock for onSnapshot to be controllable
        (firestore.onSnapshot as vi.Mock).mockImplementation((query, callback) => {
            onSnapshotCallback = callback;
            // Return an unsubscribe function
            return vi.fn();
        });
    });

    const createMockPlayer = (id: string, name: string, score: number) => ({
        id,
        data: () => ({ name, surname: 'Test', score, email: '', phone: '' }),
    });

    const mockSnapshot = (docs: any[]) => ({
        docs,
        forEach: (callback: (doc: any) => void) => {
            docs.forEach(callback);
        },
    });

    it('should create an activity log for each new player', async () => {
        render(<Home />);

        // 1. Initial load with one player
        act(() => {
            if (onSnapshotCallback) {
                onSnapshotCallback(mockSnapshot([createMockPlayer('p1', 'Player One', 100)]));
            }
        });

        await waitFor(() => {
            expect(firestore.addDoc).toHaveBeenCalledTimes(1);
        });

        const call1 = (firestore.addDoc as vi.Mock).mock.calls[0];
        expect(call1[1].type).toBe('add');
        expect(call1[1].player.name).toBe('Player One');

        // 2. A new player is added
        act(() => {
            if (onSnapshotCallback) {
                onSnapshotCallback(mockSnapshot([
                    createMockPlayer('p1', 'Player One', 100),
                    createMockPlayer('p2', 'Player Two', 120)
                ]));
            }
        });

        await waitFor(() => {
            expect(firestore.addDoc).toHaveBeenCalledTimes(2);
        });

        const call2 = (firestore.addDoc as vi.Mock).mock.calls[1];
        expect(call2[1].type).toBe('add');
        expect(call2[1].player.name).toBe('Player Two');
    });

    it('should not create a log when player data is refreshed without changes', async () => {
        render(<Home />);

        // 1. Initial load
        act(() => {
            if (onSnapshotCallback) {
                onSnapshotCallback(mockSnapshot([createMockPlayer('p1', 'Player One', 100)]));
            }
        });
        await waitFor(() => {
            // A log for the initial player is expected
            expect(firestore.addDoc).toHaveBeenCalledTimes(1);
        });

        // 2. "Refresh" data with the exact same content
        act(() => {
            if (onSnapshotCallback) {
                onSnapshotCallback(mockSnapshot([createMockPlayer('p1', 'Player One', 100)]));
            }
        });

        await waitFor(() => {
             // addDoc should not have been called again
            expect(firestore.addDoc).toHaveBeenCalledTimes(1);
        });
    });
});
