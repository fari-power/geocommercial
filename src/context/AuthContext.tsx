import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

interface User {
    id?: number;
    email?: string;
    phone?: string;
    phone_number?: string;
    name?: string;
    role?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isInitialLoading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Synchroniser l'état d'authentification au chargement de l'application
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsInitialLoading(false);
                return;
            }

            try {
                // Utiliser l'intercepteur pour ajouter le token automatiquement
                const response = await api.get('/auth/me');
                if (response.data) {
                    setIsAuthenticated(true);
                    setUser(response.data);
                } else {
                    // Token invalide
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de la session:', error);
                localStorage.removeItem('token');
            } finally {
                setIsInitialLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data && response.data.token) {
                const { token, user: userData } = response.data;
                
                // Persister le token
                localStorage.setItem('token', token);
                
                setIsAuthenticated(true);
                setUser(userData || { email });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isInitialLoading, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
