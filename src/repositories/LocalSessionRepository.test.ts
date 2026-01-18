import { LocalSessionRepository } from './LocalSessionRepository';
import { SavedSession } from '../domain/session';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LocalSessionRepository', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('saveToStorage should update existing session if ID matches', () => {
        const session1: SavedSession = {
            id: '123',
            createdAt: '2023-01-01',
            juryDate: '2023-01-02',
            jobTitle: 'Developer',
            parameters: {} as any,
            confirmedCandidates: []
        };

        const sessionUpdated: SavedSession = {
            ...session1,
            jobTitle: 'Senior Developer'
        };

        LocalSessionRepository.saveToStorage(session1);
        let stored = LocalSessionRepository.readAll();
        expect(stored.length).toBe(1);
        expect(stored[0].jobTitle).toBe('Developer');

        LocalSessionRepository.saveToStorage(sessionUpdated);
        stored = LocalSessionRepository.readAll();
        expect(stored.length).toBe(1);
        expect(stored[0].jobTitle).toBe('Senior Developer');
    });

    it('saveToStorage should add new session if ID is new', () => {
        const session1: SavedSession = {
            id: '123',
            createdAt: '2023-01-01',
            juryDate: '2023-01-02',
            jobTitle: 'Dev',
            parameters: {} as any,
            confirmedCandidates: []
        };
        const session2: SavedSession = {
            ...session1,
            id: '456',
            jobTitle: 'QA'
        };

        LocalSessionRepository.saveToStorage(session1);
        LocalSessionRepository.saveToStorage(session2);

        const stored = LocalSessionRepository.readAll();
        expect(stored.length).toBe(2);
        expect(stored.find(s => s.id === '123')).toBeDefined();
        expect(stored.find(s => s.id === '456')).toBeDefined();
    });

    it('deleteFromStorage should remove session by ID', () => {
        const session1: SavedSession = { id: '123', createdAt: '', juryDate: '', jobTitle: '', parameters: {} as any, confirmedCandidates: [] };
        LocalSessionRepository.saveToStorage(session1);

        expect(LocalSessionRepository.readAll().length).toBe(1);

        LocalSessionRepository.deleteFromStorage('123');
        expect(LocalSessionRepository.readAll().length).toBe(0);
    });
});
