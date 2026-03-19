import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, MapPin, Loader2, Plus, ArrowLeft, Camera, X } from 'lucide-react';
import { useRef } from 'react';
import api from '../../lib/api';

export default function Collect() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        latitude: '',
        longitude: '',
        categorie: '',
        type: 'Formel',
        zone: '',
        image_url: '',
        phone: ''
    });

    const [categories, setCategories] = useState<string[]>([]);
    const [zones, setZones] = useState<string[]>([]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await api.get('/points/filters');
                setCategories(response.data.categories);
                setZones(response.data.zones);
            } catch (err) {
                console.error('Erreur filtres:', err);
            }
        };
        fetchFilters();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
                setFormData(prev => ({ ...prev, image_url: '' })); // Clear URL if file selected
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, image_url: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            let finalImageUrl = formData.image_url;

            // Upload file first if selected
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('image', selectedFile);
                const uploadRes = await api.post('/points/upload', uploadData);
                finalImageUrl = uploadRes.data.imageUrl;
            }

            await api.post('/points', {
                ...formData,
                image_url: finalImageUrl,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                source: 'MANUEL'
            });

            setMessage({ type: 'success', text: 'Point de vente ajouté avec succès !' });
            setTimeout(() => {
                navigate('/app/data');
            }, 2000);
        } catch (error: any) {
            console.error('Erreur ajout point:', error);
            setMessage({ type: 'error', text: 'Erreur lors de l\'ajout. Veuillez vérifier les champs.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Retour
            </button>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-slate-900 p-8 text-white">
                    <h2 className="text-3xl font-black flex items-center gap-4">
                        <Plus className="w-8 h-8 text-blue-400" />
                        Nouveau Point de Vente
                    </h2>
                    <p className="text-slate-400 mt-2">Ajoutez manuellement un nouveau commerce au référentiel.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-2xl border ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                            } flex items-center gap-3 animate-in fade-in slide-in-from-top-2`}>
                            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nom du commerce */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Nom du commerce *</label>
                            <input
                                required
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                placeholder="ex: Hanout El Kheir"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                            />
                        </div>

                        {/* Catégorie */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Catégorie *</label>
                            <select
                                required
                                name="categorie"
                                value={formData.categorie}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="autre">Autre</option>
                            </select>
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Type de commerce</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                            >
                                <option value="Formel">Formel</option>
                                <option value="Informel">Informel</option>
                            </select>
                        </div>

                        {/* Zone / Ville */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Zone / Ville *</label>
                            <input
                                required
                                list="zones-list"
                                type="text"
                                name="zone"
                                value={formData.zone}
                                onChange={handleChange}
                                placeholder="ex: Casablanca, Anfa"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                            />
                            <datalist id="zones-list">
                                {zones.map(z => <option key={z} value={z} />)}
                            </datalist>
                        </div>

                        {/* Latitude */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Latitude</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    placeholder="33.5731"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Longitude */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Longitude</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    placeholder="-7.5898"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Numéro de téléphone Agent (Nouveau champ demandé) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Téléphone de l'agent (Collecteur) *</label>
                            <div className="relative">
                                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="ex: 0612345678"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 italic">Ce numéro sera lié à ce point de vente et servira à créditer vos points (20 pts par ajout).</p>
                        </div>
                    </div>

                    {/* Adresse */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Adresse complète</label>
                        <textarea
                            name="adresse"
                            rows={3}
                            value={formData.adresse}
                            onChange={handleChange}
                            placeholder="ex: 45 Rue des Lilas, Quartier Oasis..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700">Image du point de vente</label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Upload area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Camera size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700">Prendre une photo</p>
                                    <p className="text-xs text-slate-400">ou cliquer pour parcourir</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>

                            {/* URL Alternative (Keep it as fallback) */}
                            <div className="flex flex-col justify-center gap-4">
                                <div className="h-px bg-slate-100 md:hidden" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Ou via URL</p>
                                <input
                                    type="text"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (e.target.value) {
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }
                                    }}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        {(previewUrl || formData.image_url) && (
                            <div className="relative w-full aspect-video md:w-64 md:h-64 rounded-3xl overflow-hidden border-4 border-white shadow-2xl group animate-in zoom-in-95 fill-mode-both duration-300">
                                <img
                                    src={previewUrl || formData.image_url}
                                    alt="Aperçu"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full">Changer l'image</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button
                            disabled={submitting}
                            type="submit"
                            className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Enregistrer le point
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
