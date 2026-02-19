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

    it('deleteManyFromStorage should remove multiple sessions by ID', () => {
        const session1: SavedSession = { id: '1', createdAt: '', juryDate: '', jobTitle: '', parameters: {} as any, confirmedCandidates: [] };
        const session2: SavedSession = { id: '2', createdAt: '', juryDate: '', jobTitle: '', parameters: {} as any, confirmedCandidates: [] };
        const session3: SavedSession = { id: '3', createdAt: '', juryDate: '', jobTitle: '', parameters: {} as any, confirmedCandidates: [] };

        LocalSessionRepository.saveToStorage(session1);
        LocalSessionRepository.saveToStorage(session2);
        LocalSessionRepository.saveToStorage(session3);

        expect(LocalSessionRepository.readAll().length).toBe(3);

        LocalSessionRepository.deleteManyFromStorage(['1', '3']);
        const stored = LocalSessionRepository.readAll();
        expect(stored.length).toBe(1);
        expect(stored[0].id).toBe('2');
    });

    it('saveAll (instance method) should save multiple sessions efficiently', async () => {
        const repo = new LocalSessionRepository();
        const session1: SavedSession = { id: '1', createdAt: '', juryDate: '', jobTitle: 'A', parameters: {} as any, confirmedCandidates: [] };
        const session2: SavedSession = { id: '2', createdAt: '', juryDate: '', jobTitle: 'B', parameters: {} as any, confirmedCandidates: [] };

        await repo.saveAll([session1, session2]);
        const stored = LocalSessionRepository.readAll();
        expect(stored.length).toBe(2);
        expect(stored.find(s => s.id === '1')?.jobTitle).toBe('A');
        expect(stored.find(s => s.id === '2')?.jobTitle).toBe('B');

        // Update one and add one
        const session1Updated = { ...session1, jobTitle: 'A-updated' };
        const session3: SavedSession = { id: '3', createdAt: '', juryDate: '', jobTitle: 'C', parameters: {} as any, confirmedCandidates: [] };

        await repo.saveAll([session1Updated, session3]);
        const storedAfterUpdate = LocalSessionRepository.readAll();
        expect(storedAfterUpdate.length).toBe(3);
        expect(storedAfterUpdate.find(s => s.id === '1')?.jobTitle).toBe('A-updated');
        expect(storedAfterUpdate.find(s => s.id === '3')?.jobTitle).toBe('C');
    });
});
