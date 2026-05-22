import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    PreferenceRepository,
    LocalPreferenceRepository,
    FirebasePreferenceRepository,
    UserPreferences,
    EmailTemplatesMap
} from '../repositories/PreferenceRepository';
import { DEFAULT_TEMPLATES } from '../domain/EmailTemplates';

export const usePreferences = () => {
    const { user, loading: authLoading } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: null,
        emailTemplates: DEFAULT_TEMPLATES
    });
    const [loading, setLoading] = useState(true);

    const repository: PreferenceRepository = useMemo(() => {
        if (authLoading) return new LocalPreferenceRepository();
        if (user) {
            return new FirebasePreferenceRepository(user.uid);
        }
        return new LocalPreferenceRepository();
    }, [user, authLoading]);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = repository.subscribe((prefs) => {
            setPreferences(prefs);
            if (prefs.theme) {
                localStorage.setItem('theme', prefs.theme);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [repository]);

    const saveTheme = useCallback(async (theme: string) => {
        localStorage.setItem('theme', theme);
        await repository.saveTheme(theme);
    }, [repository]);

    const saveTemplates = useCallback(async (templates: EmailTemplatesMap) => {
        await repository.saveTemplates(templates);
    }, [repository]);

    return useMemo(() => ({
        theme: preferences.theme,
        emailTemplates: preferences.emailTemplates,
        loading,
        saveTheme,
        saveTemplates
    }), [preferences.theme, preferences.emailTemplates, loading, saveTheme, saveTemplates]);
};
