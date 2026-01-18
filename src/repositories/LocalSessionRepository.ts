import { SessionRepository, SessionWithStatus } from './types';
import { SessionService, SavedSession } from '../domain/session';

type Listener = (sessions: SessionWithStatus[]) => void;

export class LocalSessionRepository implements SessionRepository {
    private static listeners: Listener[] = [];

    private static notify() {
        const sessions = SessionService.getSessions().map(s => ({
            ...s,
            syncStatus: 'local' as const
        }));
        LocalSessionRepository.listeners.forEach(l => l(sessions));
    }

    subscribe(onUpdate: Listener): () => void {
        LocalSessionRepository.listeners.push(onUpdate);

        // Initial data
        const sessions = SessionService.getSessions().map(s => ({
            ...s,
            syncStatus: 'local' as const
        }));
        onUpdate(sessions);

        return () => {
            LocalSessionRepository.listeners = LocalSessionRepository.listeners.filter(l => l !== onUpdate);
        };
    }

    async save(session: SavedSession): Promise<void> {
        // Simulate async delay if needed, but not strictly necessary for local
        SessionService.saveSession(session);
        LocalSessionRepository.notify();
    }

    async delete(id: string): Promise<void> {
        SessionService.deleteSession(id);
        LocalSessionRepository.notify();
    }
}
