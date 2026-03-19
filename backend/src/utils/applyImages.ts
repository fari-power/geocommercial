import pool from '../config/db.js';

const imageMapping: Record<string, string> = {
    'Confuserie': 'Confiserie.jpg',
    'Confiserie': 'Confiserie.jpg',
    'Épicerie': 'Epicerie.png',
    'Fast food': 'FastFood.jpg',
    'Fruits et legume': 'Fruits Et Légumes.jpg',
    'Fruits et légumes': 'Fruits Et Légumes.jpg',
    'Glacier': 'Glacier.jpg',
    'Grossiste': 'Grossiste.jpg',
    'Kiosque': 'Kiosque.jpg',
    'Magasin': 'Magasin.jpg',
    'Parapharmacie': 'Parapharmacie_jpg.jpg',
    'Pharmacie': 'Pharmacie.jpg',
    'Poissonnerie': 'Poissonerie.jpg',
    'Poissonerie': 'Poissonerie.jpg',
    'Primeur': 'Primeur.jpg',
    'Bar': 'bar.jpg',
    'Boulangerie': 'boulangerie.jpg',
    'Café': 'café.jpg',
    'Charcuterie': 'charcuterie.jpg',
    'Crémerie': 'crèmerie.jpg'
};

async function applyImages() {
    try {
        console.log('--- DÉBUT DE LA MISE À JOUR DES IMAGES ---');

        // 1. Mise à jour des noms de catégories pour cohérence
        await pool.query("UPDATE points_de_vente SET categorie = 'Confiserie' WHERE categorie = 'Confuserie'");
        await pool.query("UPDATE points_de_vente SET categorie = 'Fruits et légumes' WHERE categorie = 'Fruits et legume'");
        await pool.query("UPDATE points_de_vente SET categorie = 'Poissonerie' WHERE categorie = 'Poissonnerie'");
        await pool.query("UPDATE points_de_vente SET categorie = 'Market' WHERE categorie = 'market'");
        await pool.query("UPDATE points_de_vente SET categorie = 'Kiosque' WHERE categorie = 'kiosque'");

        // 2. Application des URLs d'images
        for (const [category, filename] of Object.entries(imageMapping)) {
            const imageUrl = `/uploads/Images applications/${filename}`;
            const [result] = await pool.query(
                "UPDATE points_de_vente SET image_url = ? WHERE categorie = ?",
                [imageUrl, category]
            );
            const affected = (result as any).affectedRows;
            if (affected > 0) {
                console.log(`✅ ${category} : ${affected} points mis à jour avec ${filename}`);
            }
        }

        console.log('--- MISE À JOUR TERMINÉE ---');
        process.exit(0);
    } catch (error) {
        console.error('Erreur:', error);
        process.exit(1);
    }
}

applyImages();
