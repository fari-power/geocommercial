import pool from '../config/db.js';

async function fixSupermarche() {
    console.log('🩹 Correction fine de la catégorie Supermarché...');

    const keywords = ['Marjane', 'Carrefour', 'Acima', 'Bim', 'Label Vie', 'Aswak Assalam', 'Supermarket', 'Supermarché'];

    try {
        let total = 0;
        for (const kw of keywords) {
            const [result]: any = await pool.query(
                "UPDATE points_de_vente SET categorie = 'Supermarché' WHERE (nom LIKE ? OR categorie = 'Superette') AND (nom LIKE ? OR nom LIKE ?)",
                [`%${kw}%`, `%${kw}%`, `%${kw.toLowerCase()}%`]
            );
            total += result.affectedRows;
            if (result.affectedRows > 0) {
                console.log(`✅ [${kw}] -> "Supermarché" : ${result.affectedRows} lignes.`);
            }
        }

        // Cas spécifique où la catégorie d'origine était Supermarché (on peut essayer de matcher sur le texte original si on l'avait, mais ici on va se baser sur le nom)
        // On va aussi chercher tout ce qui a été indûment transformé en "Superette" mais qui contient "super" (sauf les superettes)
        const [final]: any = await pool.query(
            "UPDATE points_de_vente SET categorie = 'Supermarché' WHERE categorie = 'Superette' AND (nom LIKE '%Market%' OR nom LIKE '%Super%') AND nom NOT LIKE '%Superette%'"
        );
        total += final.affectedRows;

        console.log(`\n✨ Correction terminée ! ${total} points ont été remis en "Supermarché".`);

        const [check]: any = await pool.query('SELECT DISTINCT categorie FROM points_de_vente ORDER BY categorie');
        console.log('\n--- ÉTAT FINAL DES FILTRES ---');
        console.log(check.map((r: any) => r.categorie));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

fixSupermarche();
