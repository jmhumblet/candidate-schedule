import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    loginWithEmail: async () => {},
    logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async () => {
        if (!auth) {
            alert("Firebase is not configured. Please check your src/firebase/config.ts file.");
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        if (!auth) {
            alert("Firebase is not configured.");
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Email login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
