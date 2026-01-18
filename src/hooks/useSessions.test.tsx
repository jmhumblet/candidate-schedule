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

describe('useSessions Sync Logic', () => {
    let mockSave: jest.Mock;
    let mockSubscribe: jest.Mock;
    let mockDelete: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup Repository Mock
        mockSave = jest.fn().mockResolvedValue(undefined);
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

    it('should sync local sessions to cloud when user logs in', async () => {
        // Arrange
        const mockLocalSession = { id: 'session1', ownerId: 'temp', parameters: {}, confirmedCandidates: [] } as any as SavedSession;

        jest.spyOn(LocalSessionRepository, 'readAll').mockReturnValue([mockLocalSession]);
        jest.spyOn(LocalSessionRepository, 'deleteFromStorage').mockImplementation(() => {});

        const mockUser = { uid: 'user1', email: 'test@example.com' };
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
        });

        // Act
        renderHook(() => useSessions());

        // Assert
        await waitFor(() => {
            expect(mockSave).toHaveBeenCalledTimes(1);
            expect(mockSave).toHaveBeenCalledWith(mockLocalSession);
            expect(LocalSessionRepository.deleteFromStorage).toHaveBeenCalledWith('session1');
        });
    });

    it('should NOT sync if no local sessions exist', async () => {
        // Arrange
        jest.spyOn(LocalSessionRepository, 'readAll').mockReturnValue([]);
        jest.spyOn(LocalSessionRepository, 'deleteFromStorage').mockImplementation(() => {});

        const mockUser = { uid: 'user1', email: 'test@example.com' };
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
        });

        // Act
        renderHook(() => useSessions());

        // Assert
        await waitFor(() => {
            expect(mockSubscribe).toHaveBeenCalled();
        });

        expect(mockSave).not.toHaveBeenCalled();
        expect(LocalSessionRepository.deleteFromStorage).not.toHaveBeenCalled();
    });

    it('should NOT sync if user is not logged in', async () => {
        // Arrange
        const mockLocalSession = { id: 'session1' } as any as SavedSession;
        jest.spyOn(LocalSessionRepository, 'readAll').mockReturnValue([mockLocalSession]);
        jest.spyOn(LocalSessionRepository, 'deleteFromStorage').mockImplementation(() => {});

        mockUseAuth.mockReturnValue({
            user: null, // Not logged in
            loading: false,
        });

        // Act
        renderHook(() => useSessions());

        // Assert
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockSave).not.toHaveBeenCalled();
        expect(LocalSessionRepository.deleteFromStorage).not.toHaveBeenCalled();
    });
});
