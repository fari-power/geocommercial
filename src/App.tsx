import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';
import Overview from './pages/app/Overview';
import Data from './pages/app/Data';
import Map from './pages/app/Map';
import Chat from './pages/app/Chat';
import Collect from './pages/app/Collect';
import Settings from './pages/app/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/app/*"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="overview" element={<Overview />} />
                <Route path="data" element={<Data />} />
                <Route path="map" element={<Map />} />
                <Route path="chat" element={<Chat />} />
                <Route path="collect" element={<Collect />} />
                <Route path="settings" element={<Settings />} />
                <Route index element={<Navigate to="overview" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
