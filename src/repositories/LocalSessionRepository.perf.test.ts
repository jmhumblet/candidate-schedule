import { LocalSessionRepository } from './LocalSessionRepository';
import { SavedSession } from '../domain/session';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LocalSessionRepository Performance', () => {
    let repository: LocalSessionRepository;

    beforeEach(() => {
        repository = new LocalSessionRepository();
        localStorage.clear();
        (localStorage.getItem as jest.Mock).mockClear();
        (localStorage.setItem as jest.Mock).mockClear();
    });

    it('save currently performs redundant reads', async () => {
        const session: SavedSession = {
            id: '123',
            createdAt: '2023-01-01',
            juryDate: '2023-01-02',
            jobTitle: 'Developer',
            parameters: {} as any,
            confirmedCandidates: []
        };

        await repository.save(session);

        // Optimized:
        // 1. saveToStorage calls readAll -> getItem
        // 2. notify uses the returned sessions -> NO getItem
        expect(localStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it('delete currently performs redundant reads', async () => {
         const session: SavedSession = {
            id: '123',
            createdAt: '2023-01-01',
            juryDate: '2023-01-02',
            jobTitle: 'Developer',
            parameters: {} as any,
            confirmedCandidates: []
        };
        // Setup initial state directly
        LocalSessionRepository.saveToStorage(session);
        (localStorage.getItem as jest.Mock).mockClear();

        await repository.delete('123');

        // Optimized:
        // 1. deleteFromStorage calls readAll -> getItem
        // 2. notify uses the returned sessions -> NO getItem
        expect(localStorage.getItem).toHaveBeenCalledTimes(1);
    });
});
