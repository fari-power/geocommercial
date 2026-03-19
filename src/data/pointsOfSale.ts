export interface PointOfSale {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    isFormal: boolean;
    region: string;
    city: string;
    lat: number;
    lon: number;
    source: string;
    updatedAt: string;
    image: string;
    hasCoords?: boolean;
}

export const CATEGORY_MAPPING: Record<string, string> = {
    'bar': 'Bar',
    'butcher': 'Boucherie',
    'bakery': 'Boulangerie',
    'cafe': 'Café',
    'deli': 'Charcuterie / Épicerie fine',
    'fast_food': 'Fast-food',
    'restaurant': 'Restaurant',
    'supermarket': 'Supermarché',
    'convenience': 'Supérette',
    'greengrocer': 'Primeur',
    'internet_cafe': 'Autre alimentaire',
    'pharmacy': 'Pharmacie',
    'marketplace': 'Marché',
    'ice_cream': 'Glacier',
    'grocery': 'Épicerie',
    'food': 'Produits alimentaires',
    'kiosk': 'Kiosque',
};

/**
 * Parse a CSV line handling quoted fields (e.g. fields containing commas).
 */
function parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    fields.push(current.trim());
    return fields;
}

/**
 * Extract city name from the Adresse field.
 * Handles addresses like "Ben Taïeb ⴱⵏ ⵟⵢⵢⴱ بن الطيب" by taking the first Latin part,
 * or addresses like "Avenue Marche Verte, Ben Taïeb ..." by taking the last segment.
 */
function extractCity(adresse: string): string {
    if (!adresse || adresse === 'Adresse non spécifiée') return '';

    // If there's a comma, take the last segment (usually the city/locality)
    const parts = adresse.split(',').map(p => p.trim()).filter(Boolean);
    let candidate = parts.length > 1 ? parts[parts.length - 1] : parts[0];

    // Remove common leading address words (Avenue, Rue, Bd, Av, Lot, Zone, Quartier, Hay, Centre, Immeuble)
    candidate = candidate.replace(/^(Avenue|Av\.?|Rue|Boulevard|Bd\.?|Lot|Zone|Quartier|Hay|Place|Centre|Immeuble|Complexe)\s+/i, '').trim();

    // Take only the Latin/French portion (before Tifinagh or Arabic characters)
    const latinMatch = candidate.match(/^[\p{Script=Latin}\s\-'.]+/u);
    if (latinMatch) {
        const cleaned = latinMatch[0].trim();
        // If the cleaned value looks like an intersection or contains street markers, try the last token
        const tokens = cleaned.split(/\s+/).filter(Boolean);
        if (tokens.length > 3) {
            // Heuristic: take last two tokens as city (e.g., 'El Jadida')
            return tokens.slice(-2).join(' ').trim();
        }
        return cleaned;
    }

    // Fallback: if candidate contains Arabic/Tifinagh, try to extract latin-like words elsewhere
    const fallback = candidate.replace(/[\p{Script=Arabic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Common}\p{Script=Inherited}]+/gu, '').trim();
    if (fallback) return fallback;

    return candidate.trim();
}

/**
 * Fetch and parse the CSV file from public/FichiersCSV/
 * CSV columns: Zone, Nom, Catégorie, Statut, Adresse, Opérateur, Marque, Latitude, Longitude, Image, Source
 */
export async function loadPointsOfSale(): Promise<PointOfSale[]> {
    try {
        const response = await fetch('/FichiersCSV/points_vente_ihddaden_complet_1771201503.csv');
        if (!response.ok) {
            console.error(`Erreur lors du chargement du CSV: ${response.status} ${response.statusText}`);
            return [];
        }

        const text = await response.text();
        // Remove BOM if present
        const cleanText = text.replace(/^\uFEFF/, '');
        const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);

        if (lines.length < 2) {
            console.warn('Le fichier CSV semble vide ou ne contient que l\'en-tête.');
            return [];
        }

        // Skip the header line
        const dataLines = lines.slice(1);

        const parsedPoints = dataLines.map((line, index) => {
            try {
                const fields = parseCSVLine(line);
                if (fields.length < 9) {
                    console.warn(`Ligne ${index + 2} malformée: trop peu de colonnes (${fields.length})`);
                    return null;
                }

                // Columns: Zone, Nom, Catégorie, Statut, Adresse, Opérateur, Marque, Latitude, Longitude, Image, Source
                const [zone, nom, categorie, statut, adresse, , , latitude, longitude, , source] = fields;

                const lat = parseFloat(latitude);
                const lon = parseFloat(longitude);
                const name = nom || categorie || 'Sans nom';
                const isFormal = statut === 'Formel';

                const city = extractCity(adresse) || zone || 'Non spécifiée';
                const image = `https://placehold.co/400x300/f1f5f9/1e3a8a?text=${encodeURIComponent(categorie || 'N/A')}`;

                return {
                    id: `POS-${index}-${Math.random().toString(36).substring(2, 8)}`,
                    name,
                    category: categorie || 'Autre',
                    subcategory: categorie?.toLowerCase().replace(/\s+/g, '_') || 'other',
                    isFormal,
                    region: zone || 'Non spécifiée',
                    city,
                    lat: isNaN(lat) ? 0 : lat,
                    lon: isNaN(lon) ? 0 : lon,
                    source: source || 'OSM',
                    updatedAt: '',
                    image,
                };
            } catch (err) {
                console.error(`Erreur lors du parsing de la ligne ${index + 2}:`, err);
                return null;
            }
        });

        const validPoints = parsedPoints.filter((p): p is PointOfSale => p !== null);

        // Mark whether a point has coordinates so UI can decide how to use it
        validPoints.forEach(p => {
            (p as PointOfSale).hasCoords = !(isNaN(p.lat) || isNaN(p.lon) || p.lat === 0 || p.lon === 0);
        });

        // Helper to normalize strings for deduplication
        const normalize = (s?: string) => {
            if (!s) return '';
            try {
                const n = s.normalize('NFD').replace(/\p{M}/gu, ''); // remove diacritics
                return n.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
            } catch (e) {
                return s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
            }
        };

        // Deduplicate: build a map by a composite key. Prioritize coordinates when available.
        const seen = new Map<string, PointOfSale>();
        let duplicates = 0;

        for (const p of validPoints) {
            const nameKey = normalize(p.name);
            const cityKey = normalize(p.city);
            const regionKey = normalize(p.region);

            let key: string;
            if (p.hasCoords) {
                // Use rounded coords + name + city to avoid merging distinct nearby entries
                key = `${p.lat.toFixed(5)}|${p.lon.toFixed(5)}|${nameKey}|${cityKey}`;
            } else {
                // No coords: rely on name+city+region
                key = `${nameKey}|${cityKey}|${regionKey}`;
            }

            if (!seen.has(key)) {
                seen.set(key, p);
            } else {
                duplicates++;
            }
        }

        const deduped = Array.from(seen.values());
        console.log(`${validPoints.length} points extraits du CSV (${deduped.filter(p => p.hasCoords).length} avec coordonnées). Doublons supprimés: ${duplicates}.`);
        return deduped;
    } catch (error) {
        console.error('Erreur critique lors du chargement des points de vente:', error);
        return [];
    }
}

// Keep a synchronous default export for backward compatibility during loading
const pointsOfSale: PointOfSale[] = [];
export default pointsOfSale;
