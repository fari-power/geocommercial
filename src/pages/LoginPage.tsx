import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const success = await login(email, password);

        if (success) {
            navigate('/app/overview');
        } else {
            setError('Email ou mot de passe invalide. (Demo: try 123456)');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/background_image.png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/50 to-purple-50/80 backdrop-blur-[2px]"></div>
            </div>

            {/* Glassmorphism Card */}
            <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-8 relative z-10 animate-fade-in-up">

                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-accent transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour à l'accueil
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-6 mb-8">
                        <img src="/images/redmac_logo.jpg" alt="Redmac" className="h-10 w-auto object-contain mix-blend-multiply opacity-90" />
                        <div className="h-8 w-px bg-slate-200"></div>
                        <img src="/images/logo_centrale.png" alt="Centrale" className="h-10 w-auto object-contain mix-blend-multiply opacity-90" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Bon retour</h1>
                    <p className="text-slate-600">Connectez-vous pour accéder au référentiel</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50/50 border border-red-100 rounded-xl text-sm text-red-600 animate-shake">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                                placeholder="Email professionnel"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
                                placeholder="Mot de passe"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                            <input type="checkbox" className="rounded border-slate-300 text-accent focus:ring-accent" />
                            <span>Se souvenir de moi</span>
                        </label>
                        <a href="#" className="text-accent hover:text-accent-dark font-medium transition-colors">Mot de passe oublié ?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-accent to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connexion...
                            </span>
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">
                        © 2024 GeoCommercial Maroc. Accès réservé aux partenaires.
                    </p>
                </div>
            </div>
        </div>
    );
}
