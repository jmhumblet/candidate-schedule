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
    let mockSaveAll: jest.Mock;
    let callTimes: number[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
        callTimes = [];

        // Mock save to take 100ms
        mockSave = jest.fn().mockImplementation(async () => {
            callTimes.push(Date.now());
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        mockSaveAll = jest.fn().mockImplementation(async () => {
            callTimes.push(Date.now());
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        MockFirebaseRepository.mockImplementation(() => ({
            save: mockSave,
            saveAll: mockSaveAll,
            delete: jest.fn(),
            subscribe: jest.fn().mockReturnValue(() => {}),
            share: jest.fn(),
        }));
    });

    it('should sync sessions using bulk write (benchmark)', async () => {
        const SESSION_COUNT = 3;
        const sessions = Array.from({ length: SESSION_COUNT }, (_, i) => ({
            id: `session${i}`,
            ownerId: 'temp',
            parameters: {},
            confirmedCandidates: []
        } as any as SavedSession));

        jest.spyOn(LocalSessionRepository, 'readAll').mockReturnValue(sessions);
        jest.spyOn(LocalSessionRepository, 'deleteManyFromStorage').mockImplementation(() => {});

        mockUseAuth.mockReturnValue({
            user: { uid: 'user1', email: 'test@example.com' },
            loading: false,
        });

        renderHook(() => useSessions());

        await waitFor(() => {
            expect(mockSaveAll).toHaveBeenCalledWith(sessions);
        }, { timeout: 2000 });

        // Since we use bulk write, there should only be one call initiation.
        expect(mockSaveAll).toHaveBeenCalledTimes(1);
        expect(mockSave).not.toHaveBeenCalled();
    });
});
