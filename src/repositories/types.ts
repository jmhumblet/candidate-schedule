import { SavedSession } from '../domain/session';

export type SyncStatus = 'local' | 'synced' | 'offline' | 'uploading';

export interface SessionWithStatus extends SavedSession {
    syncStatus?: SyncStatus;
    ownerId?: string;
    sharedWith?: string[];
}

export interface SessionRepository {
    /**
     * Subscribe to session updates.
     * @param onUpdate Callback function that receives the updated list of sessions.
     * @returns Unsubscribe function.
     */
    subscribe(onUpdate: (sessions: SessionWithStatus[]) => void): () => void;

    save(session: SavedSession): Promise<void>;
    delete(id: string): Promise<void>;
    share?(sessionId: string, email: string): Promise<void>;
}
