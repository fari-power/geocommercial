import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import {
    Building2,
    MapPin,
    Users,
    Bell,
    Clock,
    PieChart as PieChartIcon,
    BarChart3
} from 'lucide-react';
import api from '../../lib/api';

const STATUS_COLORS = ['#22c55e', '#3b82f6', '#475569']; // Vert (Formel), Bleu (Informel), Gris foncé (Non spécifique)

const Overview: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, rankingRes] = await Promise.all([
                    api.get('/points/stats'),
                    api.get('/auth/ranking')
                ]);
                setStats(statsRes.data);
                setRanking(rankingRes.data);
            } catch (_error) {
                console.error('Erreur data:', _error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                <p className="text-slate-500 font-medium">Analyse des performances en cours...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Supervision</h1>
                    <p className="text-gray-500 mt-1">Analyse de la répartition géographique et structurelle</p>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>MySQL Sync OK</span>
                    <span className="text-slate-300 mx-2">|</span>
                    <Clock size={16} className="text-slate-400" />
                    <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={<Building2 className="text-blue-600" />}
                    label="Points de Vente"
                    value={stats?.total?.toLocaleString()}
                    subtext="Base de données"
                    color="blue"
                />
                <MetricCard
                    icon={<MapPin className="text-emerald-600" />}
                    label="Villes Couvertes"
                    value={stats?.zonesCount?.toString()}
                    subtext="Zones actives"
                    color="emerald"
                />
                <MetricCard
                    icon={<Bell className="text-amber-600" />}
                    label="Collectes à Valider"
                    value={stats?.pendingCount?.toString()}
                    subtext="Terrain"
                    color="amber"
                    isWarning={stats?.pendingCount > 0}
                    onClick={() => navigate('/app/data?status=EN_ATTENTE')}
                />
                <MetricCard
                    icon={<Users className="text-indigo-600" />}
                    label="Équipe Terrain"
                    value={stats?.agentsCount?.toString()}
                    subtext="Agents"
                    color="indigo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ranking table */}
                <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <Users size={20} className="text-blue-600" />
                        Classement Agents
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {ranking.length > 0 ? (
                            ranking.slice(0, 10).map((user, index) => {
                                const isExpanded = selectedAgentId === user.id;
                                return (
                                <div 
                                    key={user.id} 
                                    onClick={() => setSelectedAgentId(isExpanded ? null : user.id)}
                                    className="flex flex-col bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-amber-100 text-amber-600 shadow-sm border border-amber-200' :
                                                index === 1 ? 'bg-slate-200 text-slate-600' :
                                                    index === 2 ? 'bg-orange-100 text-orange-600' :
                                                        'bg-slate-100 text-slate-400'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{user.phone_number || user.email?.split('@')[0]}</div>
                                                <div className="text-[10px] text-slate-500 font-medium">
                                                    <span className="text-purple-600 font-bold">{user.vouchersCount || 0} cadeaux</span> • {user.nb_validated} validés
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-blue-600">{user.points_sent || 0}</div>
                                            <div className="text-[9px] uppercase font-black text-slate-300">Points</div>
                                        </div>
                                    </div>
                                    
                                    {/* Historique des bons déroulant */}
                                    {isExpanded && (
                                        <div className="p-4 pt-2 border-t border-slate-100 bg-white rounded-b-2xl">
                                            <h4 className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1">
                                                <Bell size={12} />
                                                Historique des bons
                                            </h4>
                                            {user.vouchers && user.vouchers.length > 0 ? (
                                                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                                    {user.vouchers.map((v: any, i: number) => (
                                                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-800">{v.partner}</span>
                                                                <span className="text-[9px] text-slate-400">
                                                                    {new Date(v.created_at).toLocaleDateString('fr-FR')} - {v.code}
                                                                </span>
                                                            </div>
                                                            <div className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-md">
                                                                -{v.value} PTS
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                    <p className="text-xs text-slate-400 font-medium italic">Aucun cadeau réclamé</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )})
                        ) : (
                            <div className="text-center py-12 text-slate-400 italic text-sm">Aucun agent actif</div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-8 h-full">
                    {/* Structure du Marché - Pie Chart */}
                    <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <PieChartIcon size={20} className="text-purple-600" />
                            Structure du Marché
                        </h3>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.byType}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {stats?.byType?.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top 10 Villes - Bar Chart */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <BarChart3 size={20} className="text-blue-600" />
                    Top 10 Villes par Présence
                </h3>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.byCity} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                                width={80}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Flux Récent - Courbe d'Activité */}
            <div className="bg-[#0f172a] p-8 rounded-[2.5rem] shadow-2xl border border-slate-800/50">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BarChart3 size={20} className="text-blue-400" />
                            Dernières Activités Terrain
                        </h3>
                        <p className="text-slate-400 text-xs font-medium">Évolution quotidienne des collectes validées et enregistrées</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black tracking-widest uppercase border border-blue-500/20">Live Sync</span>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCountDark" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeOpacity={0.5} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return `${date.getDate()} ${date.toLocaleString('fr-FR', { month: 'short' })} ${date.getHours()}h`;
                                }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    borderRadius: '16px',
                                    border: '1px solid #334155',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    color: '#f8fafc',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}
                                labelFormatter={(label) => new Date(label).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorCountDark)"
                                animationDuration={2500}
                                strokeLinecap="round"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ icon: any, label: string, value: string, subtext: string, color: string, isWarning?: boolean, onClick?: () => void }> = ({ icon, label, value, subtext, color, isWarning, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white p-6 rounded-3xl shadow-sm border transition-all hover:translate-y-[-4px] group ${isWarning ? 'border-amber-200' : 'border-slate-100'} ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''}`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-4 bg-${color}-50 rounded-2xl`}>{icon}</div>
            {isWarning && <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">CHECK</span>}
        </div>
        <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-500">{label}</h4>
            <div className="text-3xl font-black text-slate-900">{value || '0'}</div>
            <p className="text-[11px] text-slate-400 font-medium">{subtext}</p>
        </div>
    </div>
);

export default Overview;
