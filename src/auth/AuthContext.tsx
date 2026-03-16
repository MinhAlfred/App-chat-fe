import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
    login as loginApi,
    logout as logoutApi,
    refresh as refreshApi,
    register as registerApi,
    LoginPayload,
    RegisterPayload,
} from '../api/auth-api';
import { clearTokens, getRefreshToken, hasAuthSession, saveTokens } from './session';

type AuthContextValue = {
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isInitializing, setIsInitializing] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const bootstrap = async () => {
            if (!hasAuthSession()) {
                setIsAuthenticated(false);
                setIsInitializing(false);
                return;
            }

            try {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    const tokens = await refreshApi(refreshToken);
                    saveTokens(tokens);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch {
                clearTokens();
                setIsAuthenticated(false);
            } finally {
                setIsInitializing(false);
            }
        };

        void bootstrap();
    }, []);

    const login = async (payload: LoginPayload) => {
        const tokens = await loginApi(payload);
        saveTokens(tokens);
        setIsAuthenticated(true);
    };

    const register = async (payload: RegisterPayload) => {
        const tokens = await registerApi(payload);
        saveTokens(tokens);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch {
            // ignore logout errors and clear local session anyway
        } finally {
            clearTokens();
            setIsAuthenticated(false);
        }
    };

    const value = useMemo(
        () => ({
            isAuthenticated,
            isInitializing,
            login,
            register,
            logout,
        }),
        [isAuthenticated, isInitializing],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
};