import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PointOfSale } from '../../data/pointsOfSale';
import { usePointsOfSale } from '../../hooks/usePointsOfSale';
import { Navigation, ArrowLeft, Search, Filter, MapPin, Loader2 } from 'lucide-react';

const defaultIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});


// Component to fit map bounds to displayed points (Multiple Points)
function MapBoundsController({ points }: { points: PointOfSale[] }) {
    const map = useMap();

    useEffect(() => {
        if (points.length === 0) return;

        const lats = points.map(p => p.lat);
        const lons = points.map(p => p.lon);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);

        if (points.length === 1) {
            map.flyTo([points[0].lat, points[0].lon], 14, { duration: 1.5 });
        } else {
            map.fitBounds(
                [[minLat, minLon], [maxLat, maxLon]],
                { padding: [50, 50], maxZoom: 13, duration: 1.5 }
            );
        }
    }, [points, map]);

    return null;
}

// Component to add a small locate button and scale
// (scale / locate control removed — unused in restored implementation)

export default function Map() {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: pointsOfSale, loading } = usePointsOfSale();
    const [activePointId, setActivePointId] = useState<string | null>(null);
    const [returnParams, setReturnParams] = useState<string | null>(null);

    // Internal State for Map Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const cities = useMemo(() => Array.from(new Set(pointsOfSale.map((p) => p.city))).filter(Boolean).sort(), [pointsOfSale]);
    const categories = useMemo(() => Array.from(new Set(pointsOfSale.map((p) => p.category))).sort(), [pointsOfSale]);

    // Check for passed state from Data page
    useEffect(() => {
        if (pointsOfSale.length === 0) return;

        if (location.state?.focusPointId) {
            const point = pointsOfSale.find(p => p.id === location.state.focusPointId);
            if (point) {
                setActivePointId(point.id);
                setSearchTerm('');
                setSelectedCity('');
                setSelectedCategory('');
            }
        }

        if (location.state?.returnSearchParams) {
            setReturnParams(location.state.returnSearchParams);
        }

        if (location.state?.filters) {
            setSearchTerm(location.state.filters.searchTerm || '');
            setSelectedCity(location.state.filters.selectedCity || '');
            setSelectedCategory(location.state.filters.selectedCategory || '');
        }
    }, [location.state, pointsOfSale]);

    const handleItinerary = (point: PointOfSale) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lon}`;
        window.open(url, '_blank');
    };

    const handleBackToSearch = () => {
        navigate(`/app/data?${returnParams || ''}`);
    };

    // Determine points to display
    const displayedPoints = useMemo(() => {
        if (activePointId && !searchTerm && !selectedCity && !selectedCategory) {
            return pointsOfSale.filter(p => p.id === activePointId);
        }

        return pointsOfSale.filter(point => {
            const matchSearch = !searchTerm ||
                point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                point.category.toLowerCase().includes(searchTerm.toLowerCase());

            const matchCity = !selectedCity || point.city === selectedCity;
            const matchCategory = !selectedCategory || point.category === selectedCategory;

            return matchSearch && matchCity && matchCategory;
        });
    }, [pointsOfSale, searchTerm, selectedCity, selectedCategory, activePointId]);

    // Points with valid coordinates (used for map markers and bounds)
    const pointsWithCoords = useMemo(() => displayedPoints.filter(p => p.lat && p.lon && p.lat !== 0 && p.lon !== 0), [displayedPoints]);

    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <span className="ml-3 text-slate-500">Chargement de la carte...</span>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group flex">
            {/* Sidebar Filters Overlay */}
            <div className="absolute left-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm z-[400] rounded-xl shadow-xl flex flex-col border border-slate-100/50 transition-transform -translate-x-full md:translate-x-0">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-accent" />
                        Filtres
                    </h3>
                    <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                        {displayedPoints.length} points
                    </span>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setActivePointId(null); }}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        />
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 ml-1">Ville</label>
                        <select
                            value={selectedCity}
                            onChange={(e) => { setSelectedCity(e.target.value); setActivePointId(null); }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-slate-700"
                        >
                            <option value="">Toutes les villes</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 ml-1">Catégorie</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => { setSelectedCategory(e.target.value); setActivePointId(null); }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-slate-700"
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {/* Result List Preview */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Résultats</h4>
                        <div className="space-y-2">
                            {displayedPoints.slice(0, 5).map(point => (
                                <button
                                    key={point.id}
                                    onClick={() => {
                                        setActivePointId(point.id);
                                    }}
                                    className="w-full text-left p-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3 group"
                                >
                                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate group-hover:text-accent">{point.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{point.category}</p>
                                    </div>
                                </button>
                            ))}
                            {displayedPoints.length > 5 && (
                                <p className="text-xs text-center text-slate-400 mt-2">
                                    + {displayedPoints.length - 5} autres points sur la carte
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                    {returnParams && (
                        <button
                            onClick={handleBackToSearch}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour tableau
                        </button>
                    )}
                </div>
            </div>

            <MapContainer
                center={[31.7917, -7.0926]} // Centre du Maroc
                zoom={6}
                className="w-full h-full z-0"
                scrollWheelZoom={true}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBoundsController points={pointsWithCoords} />

                {pointsWithCoords.map((point) => (
                    <Marker
                        key={point.id}
                        position={[point.lat, point.lon]}
                        icon={defaultIcon}
                        eventHandlers={{
                            click: () => {
                                setActivePointId(point.id);
                            },
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-semibold text-slate-900 mb-1">{point.name}</h3>
                                <div className="text-xs text-slate-500 mb-3">
                                    {point.category} • {point.city}
                                </div>

                                <div className="text-xs space-y-1 mb-3 bg-slate-50 p-2 rounded">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Statut:</span>
                                        <span className="font-medium text-slate-700">{point.isFormal ? 'Formel' : 'Informel'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Coord:</span>
                                        <span className="font-mono text-slate-700">{point.lat.toFixed(3)}, {point.lon.toFixed(3)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => handleItinerary(point)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white hover:bg-accent-dark rounded-lg text-xs font-medium transition-colors"
                                    >
                                        <Navigation className="w-3 h-3" />
                                        Tracer l'itinéraire
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
