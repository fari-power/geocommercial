import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    user: { email: string } | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ email: string } | null>(null);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Mock authentication - accept any email/password for MVP
        // In production, this would call a backend API
        if (email && password.length >= 6) {
            setIsAuthenticated(true);
            setUser({ email });
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
