export const getDefaultImage = (nom: string | null | undefined, categorie: string | null | undefined): string | null => {
    const rules = [
        // Enseignes spécifiques (Priorité TRÈS haute)
        { match: 'kfc', image: '/uploads/Images%20applications/KFC.png' },
        { match: 'bim', image: '/uploads/Images%20applications/Bim.png' },
        { match: 'bîm', image: '/uploads/Images%20applications/Bim.png' },
        { match: 'marjane', image: '/uploads/Images%20applications/Marjane.png' },
        { match: 'carrefour', image: '/uploads/Images%20applications/Carrefour%20Market.png' },
        { match: 'mcdonald', image: "/uploads/Images%20applications/McDonald's.png" },
        { match: 'pizza hut', image: '/uploads/Images%20applications/Pizza%20Hut.png' },

        // Types de commerces spécifiques
        { match: 'mall', image: '/uploads/Images%20applications/Mall.png' },
        { match: 'market', image: '/uploads/Images%20applications/Market.png' },
        { match: 'pub', image: '/uploads/Images%20applications/Pubs.png' },
        { match: 'superette', image: '/uploads/Images%20applications/Superettes.png' },
        { match: 'supérette', image: '/uploads/Images%20applications/Superettes.png' },
        { match: 'superete', image: '/uploads/Images%20applications/Superettes.png' },

        // Alimentation & Restauration
        { match: 'restaurant', image: '/uploads/Images%20applications/Restaurant.png' },
        { match: 'fast food', image: '/uploads/Images%20applications/FastFood.jpg' },
        { match: 'café', image: '/uploads/Images%20applications/café.jpg' },
        { match: 'cafe', image: '/uploads/Images%20applications/café.jpg' },
        { match: 'laiterie', image: '/uploads/Images%20applications/crèmerie.jpg' },
        { match: 'crèmerie', image: '/uploads/Images%20applications/crèmerie.jpg' },
        { match: 'cremerie', image: '/uploads/Images%20applications/crèmerie.jpg' },
        { match: 'laitier', image: '/uploads/Images%20applications/crèmerie.jpg' },
        { match: 'epicerie', image: '/uploads/Images%20applications/Epicerie.png' },
        { match: 'épicerie', image: '/uploads/Images%20applications/Epicerie.png' },
        { match: 'hanout', image: '/uploads/Images%20applications/Epicerie.png' },
        { match: 'hanut', image: '/uploads/Images%20applications/Epicerie.png' },
        { match: 'boulangerie', image: '/uploads/Images%20applications/boulangerie.jpg' },
        { match: 'boucherie', image: '/uploads/Images%20applications/Boucherie.png' },
        { match: 'charcuterie', image: '/uploads/Images%20applications/charcuterie.jpg' },

        // Santé & Beauté
        { match: 'pharmacie', image: '/uploads/Images%20applications/Pharmacie.jpg' },
        { match: 'parapharmacie', image: '/uploads/Images%20applications/Parapharmacie_jpg.jpg' },

        // Autres
        { match: 'glacier', image: '/uploads/Images%20applications/Glacier.jpg' },
        { match: 'bar', image: '/uploads/Images%20applications/bar.jpg' },
        { match: 'poisson', image: '/uploads/Images%20applications/Poissonerie.jpg' },
        { match: 'kiosque', image: '/uploads/Images%20applications/Kiosque.jpg' },
        { match: 'magasin', image: '/uploads/Images%20applications/Magasin.jpg' },
        { match: 'supermarch', image: '/uploads/Images%20applications/Magasin.jpg' },
        { match: 'primeur', image: '/uploads/Images%20applications/Primeur.jpg' },
        { match: 'fruit', image: '/uploads/Images%20applications/Fruits%20Et%20Légumes.jpg' },
        { match: 'grossiste', image: '/uploads/Images%20applications/Grossiste.jpg' },
        { match: 'confiserie', image: '/uploads/Images%20applications/Confiserie.jpg' }
    ];

    const lowerNom = (nom || '').toLowerCase();
    const lowerCat = (categorie || '').toLowerCase();

    if (!lowerNom && !lowerCat) return null;

    // 1. On cherche d'abord dans le NOM (plus précis)
    for (const rule of rules) {
        if (lowerNom.includes(rule.match)) {
            return rule.image;
        }
    }

    // 2. Si rien dans le nom, on cherche dans la CATEGORIE
    for (const rule of rules) {
        if (lowerCat.includes(rule.match)) {
            return rule.image;
        }
    }

    return null;
};
