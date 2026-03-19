import pool from '../config/db.js';

const rules = [
    { type: 'nom', match: 'kfc', image: '/uploads/Images%20applications/KFC.png' },
    { type: 'nom', match: 'bim', image: '/uploads/Images%20applications/Bim.png' },
    { type: 'nom', match: 'marjane', image: '/uploads/Images%20applications/Marjane.png' },
    { type: 'nom', match: 'carrefour', image: '/uploads/Images%20applications/Carrefour%20Market.png' },
    { type: 'nom', match: 'mcdonald', image: "/uploads/Images%20applications/McDonald's.png" },
    { type: 'nom', match: 'pizza hut', image: '/uploads/Images%20applications/Pizza%20Hut.png' },
    { type: 'nom', match: 'burger king', image: '/uploads/Images%20applications/FastFood.jpg' },

    { type: 'categorie', match: 'restaurant', image: '/uploads/Images%20applications/FastFood.jpg' },
    { type: 'categorie', match: 'fast food', image: '/uploads/Images%20applications/FastFood.jpg' },
    { type: 'categorie', match: 'café', image: '/uploads/Images%20applications/café.jpg' },
    { type: 'categorie', match: 'cafe', image: '/uploads/Images%20applications/café.jpg' },
    { type: 'categorie', match: 'epicerie', image: '/uploads/Images%20applications/Epicerie.png' },
    { type: 'categorie', match: 'épicerie', image: '/uploads/Images%20applications/Epicerie.png' },
    { type: 'categorie', match: 'boulangerie', image: '/uploads/Images%20applications/boulangerie.jpg' },
    { type: 'categorie', match: 'pharmacie', image: '/uploads/Images%20applications/Pharmacie.jpg' },
    { type: 'categorie', match: 'parapharmacie', image: '/uploads/Images%20applications/Parapharmacie_jpg.jpg' },
    { type: 'categorie', match: 'glacier', image: '/uploads/Images%20applications/Glacier.jpg' },
    { type: 'categorie', match: 'bar', image: '/uploads/Images%20applications/bar.jpg' },
    { type: 'categorie', match: 'poisson', image: '/uploads/Images%20applications/Poissonerie.jpg' },
    { type: 'categorie', match: 'kiosque', image: '/uploads/Images%20applications/Kiosque.jpg' },
    { type: 'categorie', match: 'magasin', image: '/uploads/Images%20applications/Magasin.jpg' },
    { type: 'categorie', match: 'supermarch', image: '/uploads/Images%20applications/Magasin.jpg' },
    { type: 'categorie', match: 'primeur', image: '/uploads/Images%20applications/Primeur.jpg' },
    { type: 'categorie', match: 'fruit', image: '/uploads/Images%20applications/Fruits%20Et%20Légumes.jpg' },
    { type: 'categorie', match: 'grossiste', image: '/uploads/Images%20applications/Grossiste.jpg' },
    { type: 'categorie', match: 'confiserie', image: '/uploads/Images%20applications/Confiserie.jpg' },
    { type: 'categorie', match: 'charcuterie', image: '/uploads/Images%20applications/charcuterie.jpg' },
    { type: 'categorie', match: 'crèmerie', image: '/uploads/Images%20applications/crèmerie.jpg' },
    { type: 'categorie', match: 'cremerie', image: '/uploads/Images%20applications/crèmerie.jpg' },
];

async function updateImages() {
    try {
        console.log('🚀 Début de l\'attribution automatique des images (v2 avec encodage)...');
        let total = 0;

        for (const rule of rules) {
            const imageUrl = rule.image;

            if (rule.type === 'nom') {
                const [result]: any = await pool.query(
                    "UPDATE points_de_vente SET image_url = ? WHERE LOWER(nom) LIKE ?",
                    [imageUrl, `%${rule.match}%`]
                );
                if (result.affectedRows > 0) {
                    console.log(`✅ [BRAND] ${rule.match.toUpperCase()}: ${result.affectedRows} points mis à jour.`);
                    total += result.affectedRows;
                }
            } else {
                const [result]: any = await pool.query(
                    "UPDATE points_de_vente SET image_url = ? WHERE (LOWER(categorie) LIKE ?) AND (image_url IS NULL OR image_url = '' OR image_url NOT LIKE '/uploads/Images%')",
                    [imageUrl, `%${rule.match}%`]
                );
                if (result.affectedRows > 0) {
                    console.log(`✅ [CATEGORY] ${rule.match}: ${result.affectedRows} points mis à jour.`);
                    total += result.affectedRows;
                }
            }
        }

        console.log(`\n🎉 Terminé ! Total de points mis à jour : ${total}`);
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Erreur lors de la mise à jour:', error.message);
        process.exit(1);
    }
}

updateImages();
