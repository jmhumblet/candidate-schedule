import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    arrayUnion,
    or
} from 'firebase/firestore';
import { db } from '../firebase';
import { SessionRepository, SessionWithStatus } from './types';
import { SavedSession } from '../domain/session';

export class FirebaseSessionRepository implements SessionRepository {
    private userId: string;
    private userEmail: string | null;

    constructor(userId: string, userEmail: string | null) {
        this.userId = userId;
        this.userEmail = userEmail;
    }

    subscribe(onUpdate: (sessions: SessionWithStatus[]) => void): () => void {
        if (!db) return () => {};

        const sessionsRef = collection(db, 'sessions');

        // Query: Owner is me OR SharedWith contains my email
        let q;
        if (this.userEmail) {
            q = query(sessionsRef, or(
                where('ownerId', '==', this.userId),
                where('sharedWith', 'array-contains', this.userEmail)
            ));
        } else {
            q = query(sessionsRef, where('ownerId', '==', this.userId));
        }

        const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
            const sessions: SessionWithStatus[] = snapshot.docs.map(doc => {
                const data = doc.data() as SavedSession & { ownerId: string; sharedWith?: string[] };
                const isLocal = doc.metadata.hasPendingWrites;
                return {
                    ...data,
                    id: doc.id,
                    syncStatus: isLocal ? 'offline' : 'synced',
                    ownerId: data.ownerId,
                    sharedWith: data.sharedWith
                };
            });
            onUpdate(sessions);
        });

        return unsubscribe;
    }

    async save(session: SavedSession): Promise<void> {
        if (!db) throw new Error("Firebase not initialized");

        const docRef = doc(db, 'sessions', session.id);

        // Check if the passed session object has an ownerId (preserved from state)
        // If not, we assume we are the owner (new session or taking ownership if valid)
        const ownerId = (session as any).ownerId;

        const dataToSave = {
            ...session,
            // If ownerId is present, use it. If not, use current userId.
            // This ensures we don't overwrite the owner of a shared session if we properly pass the existing ownerId.
            // If we are creating a new one, ownerId is undefined, so we set it to us.
            ownerId: ownerId || this.userId
        };

        // Remove undefined fields
        Object.keys(dataToSave).forEach(key => (dataToSave as any)[key] === undefined && delete (dataToSave as any)[key]);

        await setDoc(docRef, dataToSave, { merge: true });
    }

    async delete(id: string): Promise<void> {
        if (!db) return;
        await deleteDoc(doc(db, 'sessions', id));
    }

    async share(sessionId: string, email: string): Promise<void> {
        if (!db) return;
        const docRef = doc(db, 'sessions', sessionId);
        await updateDoc(docRef, {
            sharedWith: arrayUnion(email)
        });
    }
}
