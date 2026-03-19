import pool from '../config/db.js';

async function migrateCategories() {
    console.log('🚀 Restauration de la catégorie Supermarché...');

    const mappings = [
        { targets: ['supermarché', 'supermarket', 'super marchè'], replacement: 'Supermarché' },
        { targets: ['sperette', 'supérette', 'superette', 'supérette / mini-market', 'convenience store', 'mini market'], replacement: 'Superette' }
    ];

    try {
        let totalUpdated = 0;

        for (const mapping of mappings) {
            for (const target of mapping.targets) {
                const [result]: any = await pool.query(
                    'UPDATE points_de_vente SET categorie = ? WHERE LOWER(TRIM(categorie)) = ? OR (LOWER(categorie) LIKE ? AND categorie != "Supermarché")',
                    [mapping.replacement, target.toLowerCase(), `%${target}%`]
                );
                if (result.affectedRows > 0) {
                    console.log(`✅ [${target}] -> "${mapping.replacement}" : ${result.affectedRows} lignes.`);
                    totalUpdated += result.affectedRows;
                }
            }
        }

        console.log(`\n✨ Restauration terminée ! ${totalUpdated} lignes traitées.`);

        const [finalCheck]: any = await pool.query('SELECT DISTINCT categorie FROM points_de_vente ORDER BY categorie');
        console.log('\n--- ÉTAT ACTUALISÉ DES FILTRES ---');
        console.log(finalCheck.map((r: any) => r.categorie));

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

migrateCategories();
