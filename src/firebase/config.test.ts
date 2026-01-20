import { firebaseConfig } from './config';

describe('Firebase Config', () => {
    it('should have the correct structure', () => {
        expect(firebaseConfig).toHaveProperty('apiKey');
        expect(firebaseConfig).toHaveProperty('authDomain');
        expect(firebaseConfig).toHaveProperty('projectId');
    });

    it('should use placeholder if env var is missing (in test env)', () => {
        // In test environment (jest), .env.local is typically not loaded by create-react-app
        // unless we use .env.test.local.
        // So we expect the fallback if the env vars are not manually injected.
        if (!process.env.REACT_APP_FIREBASE_API_KEY) {
            expect(firebaseConfig.apiKey).toBe('PLACEHOLDER_API_KEY');
        } else {
            // If the environment happens to have it (e.g. CI or .env.test), verify it matches
            expect(firebaseConfig.apiKey).toBe(process.env.REACT_APP_FIREBASE_API_KEY);
        }
    });
});
