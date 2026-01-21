import { SessionRepository, SessionWithStatus } from './types';
import { SavedSession } from '../domain/session';

type Listener = (sessions: SessionWithStatus[]) => void;

export class LocalSessionRepository implements SessionRepository {
    private static listeners: Listener[] = [];
    private static STORAGE_KEY = 'interview_scheduler_sessions';

    static readAll(): SavedSession[] {
        const data = localStorage.getItem(LocalSessionRepository.STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse sessions", e);
            return [];
        }
    }

    static saveToStorage(session: SavedSession): SavedSession[] {
        const sessions = LocalSessionRepository.readAll();
        const existingIndex = sessions.findIndex(s => s.id === session.id);

        if (existingIndex >= 0) {
            sessions[existingIndex] = session;
        } else {
            sessions.push(session);
        }

        localStorage.setItem(LocalSessionRepository.STORAGE_KEY, JSON.stringify(sessions));
        return sessions;
    }

    static deleteFromStorage(id: string): SavedSession[] {
        const sessions = LocalSessionRepository.readAll();
        const filtered = sessions.filter(s => s.id !== id);
        localStorage.setItem(LocalSessionRepository.STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
    }

    private static notify(sessions: SavedSession[]) {
        const sessionsWithStatus = sessions.map(s => ({
            ...s,
            syncStatus: 'local' as const
        }));
        LocalSessionRepository.listeners.forEach(l => l(sessionsWithStatus));
    }

    subscribe(onUpdate: Listener): () => void {
        LocalSessionRepository.listeners.push(onUpdate);

        // Initial data
        const sessions = LocalSessionRepository.readAll().map(s => ({
            ...s,
            syncStatus: 'local' as const
        }));
        onUpdate(sessions);

        return () => {
            LocalSessionRepository.listeners = LocalSessionRepository.listeners.filter(l => l !== onUpdate);
        };
    }

    async save(session: SavedSession): Promise<void> {
        LocalSessionRepository.saveToStorage(session);
        LocalSessionRepository.notify();
    }

    async delete(id: string): Promise<void> {
        LocalSessionRepository.deleteFromStorage(id);
        LocalSessionRepository.notify();
    }
}
