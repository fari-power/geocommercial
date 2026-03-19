import { Link } from 'react-router-dom';
import { ChevronRight, Database, BarChart3, MapPin, MessageSquare, Shield, Mail, Phone, Linkedin, Twitter } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-100 shadow-sm z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center w-1/3">
                        {/* Using .jpg as user reported issue with previous file */}
                        <img src="/images/redmac_logo.jpg" alt="Redmac Consulting" className="h-12 w-auto object-contain mix-blend-multiply" />
                    </div>

                    <div className="flex justify-center w-1/3">
                        <Link to="/" className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap hover:text-accent transition-colors">
                            GeoCommercial Maroc
                        </Link>
                    </div>

                    <div className="flex items-center justify-end w-1/3 gap-6">
                        <img src="/images/logo_centrale.png" alt="École Centrale Casablanca" className="h-12 w-auto object-contain mix-blend-multiply" />
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section id="accueil" className="relative pt-32 pb-24 px-6 overflow-hidden">
                {/* Background Pattern */}
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/background_image.png"
                        alt="Background"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90"></div>
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-accent text-xs font-semibold uppercase tracking-wider mb-6 border border-blue-100 animate-fade-in-up">
                        Plateforme B2B
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight drop-shadow-sm animate-fade-in-up delay-100">
                        Référentiel Commercial<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-600 drop-shadow-sm">du Maroc</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up delay-200">
                        La solution Enterprise pour cartographier, analyser et dominer<br className="hidden md:block" /> le marché retail marocain.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-1 transition-all duration-300"
                        >
                            Accéder à la plateforme
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="#produit"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                        >
                            Découvrir la solution
                        </a>
                    </div>
                </div>

                {/* Wave Separator */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                    <svg className="w-full h-12 md:h-24 text-slate-50 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* Problem → Solution → Value */}
            <section id="produit" className="py-24 px-6 bg-slate-50 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Problème</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Les données commerciales au Maroc sont fragmentées, dispersées et difficiles d'accès, limitant l'analyse et la prise de décision stratégique.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Solution</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Une base centralisée et structurée regroupant les points de vente formels et informels à travers tout le territoire marocain.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Valeur</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Gain de temps, insights géographiques précis, et capacité d'analyse avancée pour orienter vos stratégies commerciales.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="fonctionnalites" className="py-24 px-6 bg-white relative z-10 clip-path-slant">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-semibold text-slate-900 text-center mb-16">Fonctionnalités</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="group p-8 border border-slate-200 rounded-2xl hover:border-accent/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300 relative z-10">
                                <Database className="w-7 h-7 text-accent group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-accent transition-colors relative z-10">Base centralisée</h3>
                            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 relative z-10">
                                Accédez à des milliers de points de vente référencés, catégorisés et géolocalisés à travers tout le Maroc.
                            </p>
                        </div>

                        <div className="group p-8 border border-slate-200 rounded-2xl hover:border-accent/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 relative z-10">
                                <BarChart3 className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors relative z-10">Dashboard Insights</h3>
                            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 relative z-10">
                                Visualisez les tendances, répartitions régionales et catégorielles grâce à des graphiques interactifs.
                            </p>
                        </div>

                        <div className="group p-8 border border-slate-200 rounded-2xl hover:border-accent/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 relative z-10">
                                <MapPin className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors relative z-10">Carte interactive</h3>
                            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 relative z-10">
                                Explorez les données géographiquement avec filtres avancés, clustering et heatmap pour identifier les zones stratégiques.
                            </p>
                        </div>

                        <div className="group p-8 border border-slate-200 rounded-2xl hover:border-accent/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 relative z-10">
                                <MessageSquare className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors relative z-10">Chatbot</h3>
                            <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 relative z-10">
                                Interrogez la base de données en langage naturel pour obtenir des réponses instantanées et des analyses sur mesure.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white rounded-full border border-slate-200 shadow-sm">
                            <Shield className="w-8 h-8 text-accent" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-4">Sécurité & Qualité</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Les données sont collectées, vérifiées et mises à jour régulièrement par nos partenaires terrain.
                        Chaque point de vente est tracé avec sa source et sa date de mise à jour pour garantir la fiabilité de l'information.
                    </p>
                </div>
            </section>

            {/* Premium Footer */}
            <footer className="bg-slate-900 text-slate-300 py-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">GeoCommercial Maroc</h2>
                        <p className="text-sm leading-relaxed text-slate-400 mb-6">
                            La première plateforme d'intelligence commerciale dédiée au marché marocain. Analysez, ciblez, performez.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Plateforme</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors">Accueil</a></li>
                            <li><Link to="/app/overview" className="hover:text-accent transition-colors">Dashboard</Link></li>
                            <li><Link to="/app/map" className="hover:text-accent transition-colors">Carte interactive</Link></li>
                            <li><Link to="/login" className="hover:text-accent transition-colors">Connexion</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Contact</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                                <span>Campus École Centrale<br />Bouskoura, Casablanca</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                                <span>contact@redmac.ma</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                                <span>+212 5 22 00 00 00</span>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Légal</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors">Conditions d'utilisation</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Politique de confidentialité</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Mentions légales</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <div>
                        © 2024 GeoCommercial Maroc. Tous droits réservés.
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Propulsé par</span>
                        <span className="text-slate-300 font-medium">Redmac Consulting</span>
                        <span>&</span>
                        <span className="text-slate-300 font-medium">École Centrale Casablanca</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
