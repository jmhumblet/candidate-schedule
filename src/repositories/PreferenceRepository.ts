import { EmailTemplate, EmailTemplateType, EmailTemplateService, DEFAULT_TEMPLATES } from '../domain/EmailTemplates';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type EmailTemplatesMap = Record<EmailTemplateType, EmailTemplate>;

export interface UserPreferences {
    theme: string | null;
    emailTemplates: EmailTemplatesMap;
}

export interface PreferenceRepository {
    subscribe(onUpdate: (prefs: UserPreferences) => void): () => void;
    saveTheme(theme: string): Promise<void>;
    saveTemplates(templates: EmailTemplatesMap): Promise<void>;
}

export class LocalPreferenceRepository implements PreferenceRepository {
    private static listeners: ((prefs: UserPreferences) => void)[] = [];

    private static getPrefs(): UserPreferences {
        return {
            theme: localStorage.getItem('theme'),
            emailTemplates: EmailTemplateService.getTemplates()
        };
    }

    private static notify() {
        const prefs = LocalPreferenceRepository.getPrefs();
        LocalPreferenceRepository.listeners.forEach(l => l(prefs));
    }

    subscribe(onUpdate: (prefs: UserPreferences) => void): () => void {
        LocalPreferenceRepository.listeners.push(onUpdate);
        onUpdate(LocalPreferenceRepository.getPrefs());
        return () => {
            LocalPreferenceRepository.listeners = LocalPreferenceRepository.listeners.filter(l => l !== onUpdate);
        };
    }

    async saveTheme(theme: string): Promise<void> {
        localStorage.setItem('theme', theme);
        LocalPreferenceRepository.notify();
    }

    async saveTemplates(templates: EmailTemplatesMap): Promise<void> {
        EmailTemplateService.saveTemplates(templates);
        LocalPreferenceRepository.notify();
    }
}

export class FirebasePreferenceRepository implements PreferenceRepository {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    subscribe(onUpdate: (prefs: UserPreferences) => void): () => void {
        if (!db) return () => {};
        const docRef = doc(db, 'user_preferences', this.userId);

        return onSnapshot(docRef, { includeMetadataChanges: true }, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                onUpdate({
                    theme: data.theme || null,
                    emailTemplates: data.emailTemplates || DEFAULT_TEMPLATES
                });
            } else {
                onUpdate({
                    theme: null,
                    emailTemplates: DEFAULT_TEMPLATES
                });
            }
        });
    }

    async saveTheme(theme: string): Promise<void> {
        if (!db) return;
        const docRef = doc(db, 'user_preferences', this.userId);
        await setDoc(docRef, { theme }, { merge: true });
    }

    async saveTemplates(templates: EmailTemplatesMap): Promise<void> {
        if (!db) return;
        const docRef = doc(db, 'user_preferences', this.userId);
        await setDoc(docRef, { emailTemplates: templates }, { merge: true });
    }
}
