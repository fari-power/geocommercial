import pool from '../config/db.js';

async function checkCategories() {
    const [rows]: any = await pool.query('SELECT DISTINCT categorie FROM points_de_vente ORDER BY categorie');
    console.log('--- CATÉGORIES ACTUELLES ---');
    console.log(rows.map((r: any) => r.categorie));
    console.log('---------------------------');
    process.exit(0);
}

checkCategories();
