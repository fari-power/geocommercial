import pool from './backend/src/config/db.js';

async function check() {
    try {
        const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM points_de_vente');
        console.log('Total points:', rows[0].count);

        const [names]: any = await pool.query('SELECT nom FROM points_de_vente LIMIT 10');
        console.log('Sample names:', names.map((n: any) => n.nom));

        const [images]: any = await pool.query('SELECT nom, image_url FROM points_de_vente WHERE image_url IS NOT NULL LIMIT 5');
        console.log('Points with images:', images);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
