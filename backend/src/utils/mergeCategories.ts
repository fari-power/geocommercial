import pool from '../config/db.js';

async function mergeCategories() {
    try {
        console.log('--- DÉBUT DE LA FUSION DES CATÉGORIES ---');

        // 1. Fusionner "autre alimentaire/ other" vers "Other"
        const [resOther] = await pool.query(
            "UPDATE points_de_vente SET categorie = 'Other' WHERE categorie = 'autre alimentaire/ other' OR categorie = 'Autre Alimentaire/ Other' OR categorie = 'autre'"
        );
        console.log(`Fusion "Other" terminée. Lignes affectées: ${(resOther as any).affectedRows}`);

        // 2. Fusionner "Magasin Générale" vers "Magasin"
        const [resMagasin] = await pool.query(
            "UPDATE points_de_vente SET categorie = 'Magasin' WHERE categorie IN ('Magasin Générale', 'Magasin Generale', 'Magasin Général', 'Magasin General', 'magasin')"
        );
        console.log(`Fusion "Magasin" terminée. Lignes affectées: ${(resMagasin as any).affectedRows}`);

        console.log('--- FUSION TERMINÉE AVEC SUCCÈS ---');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la fusion:', error);
        process.exit(1);
    }
}

mergeCategories();
