import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Navigation, Eye, Map as MapIcon, Download, Table as TableIcon, Loader2, ChevronLeft, ChevronRight, Filter, Plus, Check, X, Trash2, Save } from 'lucide-react';
import api from '../../lib/api';

export default function Data() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [points, setPoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Dynamic filters options
    const [filterOptions, setFilterOptions] = useState<{ categories: string[], zones: string[], types: string[] }>({
        categories: [],
        zones: [],
        types: []
    });

    // Read state from URL
    const searchTerm = searchParams.get('q') || '';
    const selectedCategory = searchParams.get('category') || '';
    const selectedZone = searchParams.get('zone') || '';
    const selectedType = searchParams.get('type') || '';
    const selectedStatus = searchParams.get('status') || '';
    const currentPage = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await api.get('/points/filters');
                setFilterOptions(response.data);
            } catch (err) {
                console.error('Erreur filtres:', err);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/points', {
                    params: {
                        page: currentPage,
                        limit: 50,
                        search: searchTerm,
                        category: selectedCategory,
                        zone: selectedZone,
                        type: selectedType,
                        status: selectedStatus
                    }
                });
                setPoints(response.data.data);
                setTotal(response.data.total);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Erreur chargement data:', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedCategory, selectedZone, selectedType, currentPage, selectedStatus]);

    const updateSearch = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handlePageChange = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/points/${id}/status`, { status });
            setPoints(prev => prev.map(p => p.id === id ? { ...p, statut_validation: status } : p));
        } catch (err) {
            console.error('Erreur validation:', err);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const response = await api.get('/points', {
                params: {
                    export: 'true',
                    search: searchTerm,
                    category: selectedCategory,
                    zone: selectedZone,
                    type: selectedType,
                    status: selectedStatus
                }
            });

            const dataToExport = response.data;
            const headers = ["Nom", "Adresse", "Latitude", "Longitude", "Catégorie", "Type", "Zone", "Source", "Date Collecte"];

            const csvRows = dataToExport.map((p: any) => [
                `"${p.nom?.replace(/"/g, '""') || ''}"`,
                `"${p.adresse?.replace(/"/g, '""') || ''}"`,
                p.latitude,
                p.longitude,
                `"${p.categorie || ''}"`,
                `"${p.type || ''}"`,
                `"${p.zone || ''}"`,
                `"${p.source || ''}"`,
                `"${new Date(p.date_collecte).toLocaleString()}"`
            ]);

            const csvContent = [headers.join(","), ...csvRows.map((r: any) => r.join(","))].join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `export_commerces_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Erreur export:', error);
            alert('Erreur lors de l\'exportation');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col p-4">
            {/* Header & Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center mb-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <TableIcon className="w-8 h-8 text-blue-600" />
                            Exploration des Données
                        </h2>

                        {/* Status Tabs Navigation */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit shadow-inner">
                            <button
                                onClick={() => updateSearch('status', '')}
                                className={`px-6 py-2.5 rounded-[14px] text-xs font-black transition-all ${!selectedStatus ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Explorer Tout
                            </button>
                            <button
                                onClick={() => updateSearch('status', 'EN_ATTENTE')}
                                className={`px-6 py-2.5 rounded-[14px] text-xs font-black transition-all ${selectedStatus === 'EN_ATTENTE' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                                    À Valider
                                </div>
                            </button>
                            <button
                                onClick={() => updateSearch('status', 'COLLECTE')}
                                className={`px-6 py-2.5 rounded-[14px] text-xs font-black transition-all ${selectedStatus === 'COLLECTE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Plus size={14} className="text-blue-500" />
                                    Collectes Agents
                                </div>
                            </button>
                            <button
                                onClick={() => updateSearch('status', 'REJETE')}
                                className={`px-6 py-2.5 rounded-[14px] text-xs font-black transition-all ${selectedStatus === 'REJETE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Trash2 size={14} />
                                    Rejetés (30j)
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <button
                            onClick={() => navigate('/app/collect')}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter un point
                        </button>
                        <button
                            onClick={async () => {
                                if (window.confirm('Voulez-vous réassigner les images de marque (KFC, Bim...) à tous les points ?')) {
                                    try {
                                        const res = await api.post('/points/reassign-images');
                                        alert(`${res.data.updated} points mis à jour !`);
                                        window.location.reload();
                                    } catch (err) {
                                        alert('Erreur lors de la réassignation.');
                                    }
                                }
                            }}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            Réassigner Images
                        </button>
                        <button
                            onClick={handleExportCSV}
                            disabled={exporting}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all disabled:opacity-50"
                        >
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Exporter en CSV
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nom, adresse..."
                            value={searchTerm}
                            onChange={(e) => updateSearch('q', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                        />
                    </div>

                    {/* Zone Filter (Datalist for better UX with 240+ zones) */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            list="data-zones-list"
                            placeholder="Toutes les Villes..."
                            value={selectedZone}
                            onChange={(e) => updateSearch('zone', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-medium text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                        />
                        <datalist id="data-zones-list">
                            {filterOptions.zones.map(z => <option key={z} value={z} />)}
                        </datalist>
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => updateSearch('category', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none appearance-none font-medium text-slate-700"
                        >
                            <option value="">Toutes les Catégories</option>
                            {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400" />
                        <select
                            value={selectedType}
                            onChange={(e) => updateSearch('type', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none appearance-none font-medium text-slate-700"
                        >
                            <option value="">Statut (Formel/Informel)</option>
                            {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-5 font-black">Image</th>
                                <th className="px-6 py-5 font-black">Commerce</th>
                                <th className="px-6 py-5 font-black">Catégorie</th>
                                <th className="px-6 py-5 font-black">Localisation</th>
                                <th className="px-6 py-5 font-black">Collecteur (Points)</th>
                                <th className="px-6 py-5 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 relative">
                            {loading && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            )}
                            {points.filter(p => {
                                if (selectedStatus === 'REJETE') return p.statut_validation === 'REJETE';
                                return p.statut_validation !== 'REJETE';
                            }).map((point) => (
                                <tr key={point.id} className={`hover:bg-blue-50/40 transition-colors group ${!point.is_active || point.statut_validation === 'REJETE' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    <td className="px-6 py-4">
                                        {point.image_url ? (
                                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                                <img
                                                    src={
                                                        point.image_url.includes('cloudinary.com') || point.image_url.startsWith('https://res.cloudinary.com')
                                                            ? point.image_url
                                                            : point.image_url.startsWith('http')
                                                                ? point.image_url
                                                                : `${window.location.protocol}//${window.location.hostname}:3001${point.image_url.startsWith('/') ? '' : '/'}${point.image_url}`
                                                    }
                                                    alt={point.nom}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        // Don't retry Cloudinary URLs — go straight to placeholder
                                                        if (point.image_url.includes('cloudinary.com')) {
                                                            target.src = `https://placehold.co/400x300/f1f5f9/1e3a8a?text=${encodeURIComponent(point.nom || 'Point')}`;
                                                            return;
                                                        }
                                                        // Fallback attempt: maybe backend is on the same port as frontend (proxy/production)
                                                        if (!target.dataset.triedSameOrigin) {
                                                            target.dataset.triedSameOrigin = 'true';
                                                            const path = point.image_url.startsWith('/') ? point.image_url : `/${point.image_url}`;
                                                            target.src = `${window.location.origin}${path}`;
                                                            return;
                                                        }
                                                        target.src = `https://placehold.co/400x300/f1f5f9/1e3a8a?text=${encodeURIComponent(point.nom || 'Point')}`;
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                                <MapIcon size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className='flex items-center gap-3'>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${point.type === 'Formel' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {point.nom?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{point.nom}</div>
                                                <div className="text-[11px] text-slate-400 italic">Depuis {point.source}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {point.categorie}
                                            </span>
                                            <div className="text-[10px] text-slate-400 pl-1">{point.type}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                            <MapPin size={14} className="text-slate-400" />
                                            {point.zone || 'Inconnue'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 pl-5 truncate max-w-[200px]">{point.adresse}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {point.display_phone ? (
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold text-blue-600 font-mono">{point.display_phone}</div>
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black border border-indigo-100">
                                                    {point.collecteur_points || 0} pts
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-400 italic">Système</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-4">
                                            {/* Status Switch (Active/Inactive) */}
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className={`text-[9px] font-black uppercase tracking-tighter ${point.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {point.is_active ? 'Ouvert' : 'Fermé'}
                                                </span>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.patch(`/points/${point.id}/toggle-active`, { is_active: !point.is_active });
                                                            setPoints(prev => prev.map(p => p.id === point.id ? { ...p, is_active: !p.is_active } : p));
                                                        } catch (err) {
                                                            console.error('Erreur toggle:', err);
                                                        }
                                                    }}
                                                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${point.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                >
                                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${point.is_active ? 'translate-x-[17px]' : 'translate-x-[3px]'}`} />
                                                </button>
                                            </div>

                                            {/* Validation Actions */}
                                            {point.statut_validation === 'EN_ATTENTE' && (
                                                <div className="flex items-center gap-2 bg-blue-50/50 p-1 rounded-xl border border-blue-100">
                                                    <button
                                                        onClick={() => handleUpdateStatus(point.id, 'VALIDE')}
                                                        className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm"
                                                        title="Valider"
                                                    >
                                                        <Check size={14} strokeWidth={4} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(point.id, 'REJETE')}
                                                        className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 border border-slate-200 rounded-lg hover:text-red-500 hover:border-red-200"
                                                        title="Rejeter"
                                                    >
                                                        <X size={14} strokeWidth={2} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Validation Status Badge */}
                                            {point.statut_validation !== 'EN_ATTENTE' && (
                                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${point.statut_validation === 'VALIDE'
                                                    ? 'bg-green-50 text-green-600 border border-green-100'
                                                    : 'bg-red-50 text-red-600 border border-red-100'
                                                    }`}>
                                                    {point.statut_validation === 'VALIDE' ? 'Validé' : 'Rejeté'}
                                                </div>
                                            )}

                                            <div className="flex gap-2 ml-2">
                                                <button onClick={() => navigate('/app/map', { state: { focusPointId: point.id } })} className="p-2.5 bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 rounded-xl transition-all">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`, '_blank')} className="p-2.5 bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition-all">
                                                    <Navigation size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-auto p-5 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm font-bold text-slate-500">
                        <span className="text-blue-600">{total.toLocaleString()}</span> points trouvés au total
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-3 rounded-2xl border border-slate-200 bg-white disabled:opacity-20 hover:bg-slate-50 shadow-sm transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-6 py-2 bg-white rounded-2xl border border-slate-200 text-sm font-black text-slate-800 shadow-inner">
                            Page {currentPage} / {totalPages}
                        </div>
                        <button
                            disabled={currentPage === totalPages || loading}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="p-3 rounded-2xl border border-slate-200 bg-white disabled:opacity-20 hover:bg-slate-50 shadow-sm transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
