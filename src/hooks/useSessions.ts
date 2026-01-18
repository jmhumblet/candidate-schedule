import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    SessionRepository,
    SessionWithStatus
} from '../repositories/types';
import { LocalSessionRepository } from '../repositories/LocalSessionRepository';
import { FirebaseSessionRepository } from '../repositories/FirebaseSessionRepository';
import { SavedSession, SessionService } from '../domain/session';

export const useSessions = () => {
    const { user, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<SessionWithStatus[]>([]);
    const [loading, setLoading] = useState(true);

    const repository: SessionRepository = useMemo(() => {
        if (authLoading) return new LocalSessionRepository(); // Default while loading
        if (user) {
            return new FirebaseSessionRepository(user.uid, user.email);
        }
        return new LocalSessionRepository();
    }, [user, authLoading]);

    useEffect(() => {
        const syncSessions = async () => {
            if (user && !authLoading) {
                const localSessions = SessionService.getSessions();
                if (localSessions.length > 0) {
                    for (const session of localSessions) {
                        try {
                            await repository.save(session);
                            SessionService.deleteSession(session.id);
                        } catch (error) {
                            console.error("Error syncing session:", session.id, error);
                        }
                    }
                }
            }
        };
        syncSessions();
    }, [user, authLoading, repository]);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = repository.subscribe((updatedSessions) => {
            setSessions(updatedSessions);
            setLoading(false);
        });
        return unsubscribe;
    }, [repository]);

    const saveSession = useCallback(async (session: SavedSession) => {
        await repository.save(session);
    }, [repository]);

    const deleteSession = useCallback(async (id: string) => {
        await repository.delete(id);
    }, [repository]);

    const shareSession = useCallback(async (sessionId: string, email: string) => {
        if (repository.share) {
            await repository.share(sessionId, email);
        } else {
            throw new Error("Le partage n'est disponible que lorsque vous êtes connecté.");
        }
    }, [repository]);

    return {
        sessions,
        loading,
        saveSession,
        deleteSession,
        shareSession,
        isCloud: !!user
    };
};
