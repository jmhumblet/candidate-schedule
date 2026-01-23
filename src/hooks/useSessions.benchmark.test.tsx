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

describe('useSessions Performance Benchmark', () => {
    let mockSave: jest.Mock;
    let mockSubscribe: jest.Mock;
    let mockDelete: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        // Use real timers to measure wall clock time
        jest.useRealTimers();

        // Setup Repository Mock with a delay to simulate network latency
        mockSave = jest.fn().mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay per save
        });
        mockDelete = jest.fn().mockResolvedValue(undefined);
        mockSubscribe = jest.fn().mockReturnValue(() => {});

        MockFirebaseRepository.mockImplementation(() => ({
            save: mockSave,
            delete: mockDelete,
            subscribe: mockSubscribe,
            share: jest.fn(),
        }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('measures sync time for multiple sessions', async () => {
        const SESSION_COUNT = 50;
        const mockLocalSessions: SavedSession[] = [];

        for (let i = 0; i < SESSION_COUNT; i++) {
            mockLocalSessions.push({
                id: `session-${i}`,
                createdAt: new Date().toISOString(),
                juryDate: new Date().toISOString(),
                jobTitle: 'Developer',
                parameters: { candidates: [] } as any,
                confirmedCandidates: []
            });
        }

        jest.spyOn(LocalSessionRepository, 'readAll').mockReturnValue(mockLocalSessions);
        // We need to mock deleteFromStorage to avoid actually trying to use localStorage
        // but we don't want it to affect the loop flow logic (other than being synchronous)
        jest.spyOn(LocalSessionRepository, 'deleteFromStorage').mockImplementation(() => {});

        const mockUser = { uid: 'user1', email: 'test@example.com' };
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
        });

        const startTime = Date.now();

        // Act
        renderHook(() => useSessions());

        // Assert
        // Wait for all saves to complete
        await waitFor(() => {
            expect(mockSave).toHaveBeenCalledTimes(SESSION_COUNT);
        }, { timeout: 5000 }); // Increase timeout to allow for serial execution

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`\n⚡ BENCHMARK RESULT: Syncing ${SESSION_COUNT} sessions took ${duration}ms\n`);

        // Assert that the operation completed in parallel time (approx max single delay)
        // rather than serial time (sum of delays).
        // 50 * 20ms = 1000ms (Serial) vs ~20ms (Parallel) + overhead
        expect(duration).toBeLessThan(200); // Generous buffer for overhead
    });
});
