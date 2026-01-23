import { renderHook, waitFor } from '@testing-library/react';
import { useSessions } from './useSessions';
import { useAuth } from '../contexts/AuthContext';
import { LocalSessionRepository } from '../repositories/LocalSessionRepository';
import { FirebaseSessionRepository } from '../repositories/FirebaseSessionRepository';
import { SavedSession } from '../domain/session';

// Mock AuthContext
jest.mock('../contexts/AuthContext');
const mockUseAuth = useAuth as jest.Mock;

// Mock FirebaseSessionRepository
jest.mock('../repositories/FirebaseSessionRepository');
const MockFirebaseRepository = FirebaseSessionRepository as jest.Mock;

describe('useSessions Performance', () => {
    let mockSave: jest.Mock;
    let callTimes: number[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
        callTimes = [];

        // Mock save to take 100ms
        mockSave = jest.fn().mockImplementation(async () => {
            callTimes.push(Date.now());
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        MockFirebaseRepository.mockImplementation(() => ({
            save: mockSave,
            delete: jest.fn(),
            subscribe: jest.fn().mockReturnValue(() => {}),
            share: jest.fn(),
        }));
    });

    it('should sync sessions concurrently (benchmark)', async () => {
        const SESSION_COUNT = 3;
        const sessions = Array.from({ length: SESSION_COUNT }, (_, i) => ({
            id: `session${i}`,
            ownerId: 'temp',
            parameters: {},
            confirmedCandidates: []
        } as any as SavedSession));

        jest.spyOn(LocalSessionRepository, 'readAll').mockReturnValue(sessions);
        jest.spyOn(LocalSessionRepository, 'deleteFromStorage').mockImplementation(() => {});

        mockUseAuth.mockReturnValue({
            user: { uid: 'user1', email: 'test@example.com' },
            loading: false,
        });

        renderHook(() => useSessions());

        await waitFor(() => {
            expect(mockSave).toHaveBeenCalledTimes(SESSION_COUNT);
        }, { timeout: 2000 });

        // Analyze timings
        if (callTimes.length >= 2) {
            const firstCall = callTimes[0];
            const lastCall = callTimes[callTimes.length - 1];
            const diff = lastCall - firstCall;

            console.log(`Time between first and last call initiation: ${diff}ms`);

            // If sequential: Call 1 (0ms) -> Finish (100ms) -> Call 2 (100ms)
            // Diff should be roughly (N-1) * 100ms = 200ms for 3 items.

            // If parallel: Call 1 (0ms) -> Call 2 (0msish)
            // Diff should be roughly 0-20ms.

            // We expect parallel behavior for the optimized version.
            // So this test should FAIL currently.
            expect(diff).toBeLessThan(50);
        }
    });
});
