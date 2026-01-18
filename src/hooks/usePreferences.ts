import { useState, useEffect, useMemo } from 'react';
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
            setLoading(false);
        });

        return unsubscribe;
    }, [repository]);

    const saveTheme = async (theme: string) => {
        await repository.saveTheme(theme);
    };

    const saveTemplates = async (templates: EmailTemplatesMap) => {
        await repository.saveTemplates(templates);
    };

    return {
        theme: preferences.theme,
        emailTemplates: preferences.emailTemplates,
        loading,
        saveTheme,
        saveTemplates
    };
};
