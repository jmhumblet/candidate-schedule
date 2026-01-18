import { renderHook, waitFor } from '@testing-library/react';
import { useSessions } from './useSessions';
import { useAuth } from '../contexts/AuthContext';
import { SessionService } from '../domain/session';
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

        // Setup SessionService Spies
        // We explicitly type cast to any to allow mocking static methods on the class if typescript complains,
        // but normally jest.spyOn(Class, 'method') is cleaner.
        // However, we are running in a TS environment.
    });

    // We use spyOn in the tests or beforeAll/afterAll to avoid messing up other tests if they existed.
    // Since this is a new file, beforeEach is fine, but we need to restore mocks.

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should sync local sessions to cloud when user logs in', async () => {
        // Arrange
        const mockLocalSession = { id: 'session1', ownerId: 'temp', parameters: {}, confirmedCandidates: [] } as any as SavedSession;

        jest.spyOn(SessionService, 'getSessions').mockReturnValue([mockLocalSession]);
        jest.spyOn(SessionService, 'deleteSession').mockImplementation(() => {});

        const mockUser = { uid: 'user1', email: 'test@example.com' };
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
        });

        // Act
        renderHook(() => useSessions());

        // Assert
        await waitFor(() => {
            // Check that save was called.
            // Note: Since we are mocking FirebaseSessionRepository, we are checking if the *mock instance* method was called.
            expect(mockSave).toHaveBeenCalledTimes(1);
            expect(mockSave).toHaveBeenCalledWith(mockLocalSession);
            // Delete should be called after save
            expect(SessionService.deleteSession).toHaveBeenCalledWith('session1');
        });
    });

    it('should NOT sync if no local sessions exist', async () => {
        // Arrange
        jest.spyOn(SessionService, 'getSessions').mockReturnValue([]);
        jest.spyOn(SessionService, 'deleteSession').mockImplementation(() => {});

        const mockUser = { uid: 'user1', email: 'test@example.com' };
        mockUseAuth.mockReturnValue({
            user: mockUser,
            loading: false,
        });

        // Act
        renderHook(() => useSessions());

        // Assert
        // We wait for subscribe to be called (which happens in useEffect)
        await waitFor(() => {
            expect(mockSubscribe).toHaveBeenCalled();
        });

        expect(mockSave).not.toHaveBeenCalled();
        expect(SessionService.deleteSession).not.toHaveBeenCalled();
    });

    it('should NOT sync if user is not logged in', async () => {
        // Arrange
        const mockLocalSession = { id: 'session1' } as any as SavedSession;
        jest.spyOn(SessionService, 'getSessions').mockReturnValue([mockLocalSession]);
        jest.spyOn(SessionService, 'deleteSession').mockImplementation(() => {});

        mockUseAuth.mockReturnValue({
            user: null, // Not logged in
            loading: false,
        });

        // Act
        renderHook(() => useSessions());

        // Assert
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockSave).not.toHaveBeenCalled();
        expect(SessionService.deleteSession).not.toHaveBeenCalled();
    });
});
