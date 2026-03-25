import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Search,
    Map as MapIcon,
    MessageSquare,
    LogOut,
    User,
    Menu,
    X,
    Settings,
    Home,
    PlusCircle
} from 'lucide-react';
import { useState } from 'react';

// Refactored navigation based on user feedback
const navigation = [
    { name: 'Aperçu', href: '/app/overview', icon: LayoutDashboard },
    { name: 'Data', href: '/app/data', icon: Search },
    { name: 'Carte Interactive', href: '/app/map', icon: MapIcon },
    { name: 'Collecte', href: '/app/collect', icon: PlusCircle },
    { name: 'Chatbot', href: '/app/chat', icon: MessageSquare },
    { name: 'Paramètres', href: '/app/settings', icon: Settings },
    { name: 'Retour à l\'accueil', href: '/', icon: Home },
];

export default function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const currentPage = navigation.find((item) => item.href === location.pathname)?.name || 'App';

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-30 md:relative`}
            >
                {/* Logo area */}
                <div className="h-16 border-b border-slate-200 flex items-center px-6 justify-center">
                    {isSidebarOpen ? (
                        <span className="font-bold text-slate-800 text-lg tracking-tight">GeoCommercial</span>
                    ) : (
                        <span className="font-bold text-accent text-xl">G</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${isActive
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-1 ring-slate-900/10'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                {/* Hover Background Slide Effect */}
                                {!isActive && (
                                    <span className="absolute inset-0 bg-slate-100/50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out rounded-xl origin-left" />
                                )}

                                <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-700'}`} />
                                {isSidebarOpen && <span className="text-sm font-medium relative z-10">{item.name}</span>}

                                {isActive && isSidebarOpen && (
                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                        <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <User className="w-5 h-5 text-slate-400" />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{user?.role === 'admin' ? 'Administrateur' : 'Agent Terrain'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email || user?.phone_number || user?.phone || 'Utilisateur'}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors ${!isSidebarOpen && 'justify-center'
                            }`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span className="text-xs font-medium">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-0 transition-all">
                {/* Topbar */}
                <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">{currentPage}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Add header actions if needed */}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
