import { useState, useEffect } from 'react';
import { PointOfSale, loadPointsOfSale } from '../data/pointsOfSale';
import api from '../lib/api';

// Module-level cache
let cachedData: PointOfSale[] | null = null;
let loadingPromise: Promise<PointOfSale[]> | null = null;

export function usePointsOfSale() {
    const [data, setData] = useState<PointOfSale[]>(cachedData || []);
    const [loading, setLoading] = useState(!cachedData);

    useEffect(() => {
        if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
        }

        if (!loadingPromise) {
            loadingPromise = fetchPoints();
        }

        loadingPromise.then(points => {
            cachedData = points;
            setData(points);
            setLoading(false);
        });
    }, []);

    const fetchPoints = async (): Promise<PointOfSale[]> => {
        try {
            // Optimisation : On limite à 2000 points pour éviter de faire planter le navigateur
            // L'utilisateur devra utiliser les filtres pour voir des zones spécifiques.
            const response = await api.get('/points', { params: { limit: 2000 } });
            const pointsArray = response.data?.data || (Array.isArray(response.data) ? response.data : null);

            if (pointsArray && Array.isArray(pointsArray)) {
                // Adapter le format DB vers le format attendu par le Frontend si nécessaire
                return pointsArray.map((p: any) => ({
                    id: p.id.toString(),
                    name: p.nom,
                    category: p.categorie,
                    subcategory: p.categorie?.toLowerCase() || 'other',
                    isFormal: p.type === 'Formel' || p.type === 'Formal',
                    region: p.zone,
                    city: p.zone, // Utilise zone comme ville par défaut
                    lat: parseFloat(p.latitude) || 0,
                    lon: parseFloat(p.longitude) || 0,
                    source: p.source,
                    updatedAt: p.updated_at,
                    image: p.image_url || `https://placehold.co/400x300/f1f5f9/1e3a8a?text=${encodeURIComponent(p.categorie || 'N/A')}`,
                    hasCoords: !!(parseFloat(p.latitude) && parseFloat(p.longitude))
                }));
            }
            throw new Error('Format de données invalide du backend');
        } catch (error) {
            console.warn('Backend injoignable ou erreur, repli sur le fichier CSV...', error);
            // Repli sur le chargement CSV d'origine
            return loadPointsOfSale();
        }
    };

    return {
        data, loading, refresh: () => {
            cachedData = null;
            loadingPromise = null;
            setLoading(true);
            // Force re-fetch
            fetchPoints().then(points => {
                cachedData = points;
                setData(points);
                setLoading(false);
            });
        }
    };
}
