export function normalizeCategory(cat: string): string | null {
    if (!cat) return 'Other';
    const c = cat.toLowerCase().trim();

    // --- Suppression ---
    if (c === 'department store') return null;

    // --- 1. FUSIONS DEMANDÉES (Garder les cibles demandées) ---

    // Boulangerie / Bakery
    if (c === 'bakery' || c === 'boulangerie') return 'Boulangerie';

    // Boucherie / Butcher
    if (c === 'butcher' || c === 'boucher' || c === 'boucherie') return 'Boucherie';

    // Confiserie
    if (c.includes('confiserie') || c.includes('confuserie')) return 'Confiserie';

    // Fast food
    if (c === 'fast-food' || c === 'fast food' || c === 'fastfood' || c === 'fast‑food' || c === 'restauration rapide') return 'Fast food';

    // Fruits et légumes
    if (c === 'fruit et vegetable' || c === 'fruit & vegetable' || c === 'fruits & vegetables' || c === 'fruits et legumes' || c === 'fruits et légumes') return 'Fruits et légumes';

    // Kiosque
    if (c === 'kiosk' || c === 'kios' || c === 'kiosque') return 'Kiosque';

    // Malls et Marchés
    if (c === 'centre commercial' || c === 'mall') return 'Mall';
    if (c === 'marché' || c === 'market') return 'Market';

    // Épicerie (Seulement les variantes demandées)
    if (c === 'épicerie de quartier' || c === 'grocery' || c === 'convenience store') return 'Épicerie';

    // Magasin
    if (c === 'magasin' || c === 'magasin générale' || c === 'magasin generale' || c === 'magasin général' || c === 'magasin general') return 'Magasin';

    // Autres
    if (c === 'autre' || c === 'other' || c === 'autre alimentaire/ other') return 'Other';

    // --- 2. DISTINCTION SUPERMARCHÉ / SUPERETTE ---
    if (c === 'supermarket' || c === 'supermarché' || c === 'super marchè') return 'Supermarché';
    if (c === 'sperette' || c === 'superette' || (c.includes('mini market') || c.includes('mini-market')) && c !== 'market') {
        return 'Superette';
    }

    // --- 3. CATÉGORIES À GARDER STRICTEMENT SÉPARÉES ---
    const strictCategories: Record<string, string> = {
        'café': 'Café',
        'bar': 'Bar',
        'pub': 'Pub',
        'restaurant': 'Restaurant',
        'crémerie': 'Crémerie',
        'glacier': 'Glacier',
        'poissonnerie': 'Poissonerie',
        'pharmacie': 'Pharmacie',
        'parapharmacie': 'Parapharmacie',
        'primeur': 'Primeur',
        'charcuterie': 'Charcuterie',
        'épicerie': 'Épicerie'
    };

    if (strictCategories[c]) {
        return strictCategories[c];
    }

    // --- 4. NETTOYAGE PAR DÉFAUT (Title Case) ---
    return cat.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function normalizeZone(zone: string): string {
    if (!zone || zone.trim() === '') return 'Autre';
    let normalized = zone.replace(/_/g, ' ').trim();
    return normalized
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function normalizeType(type: string): string {
    if (!type) return 'Non spécifique';
    const lower = type.toLowerCase().trim();
    if (lower === 'formal' || lower === 'formel') return 'Formel';
    if (lower === 'informal' || lower === 'informel') return 'Informel';
    return type.charAt(0).toUpperCase() + type.slice(1);
}
