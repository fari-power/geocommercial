const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'geocommercial_db'
        });

        const [rows] = await pool.query('SELECT COUNT(*) as count FROM points_de_vente');
        console.log('Total points:', rows[0].count);

        const [names] = await pool.query('SELECT nom, categorie FROM points_de_vente LIMIT 10');
        console.log('Sample data:', names);

        const [brands] = await pool.query("SELECT nom FROM points_de_vente WHERE LOWER(nom) LIKE '%kfc%' OR LOWER(nom) LIKE '%bim%' OR LOWER(nom) LIKE '%marjane%' LIMIT 5");
        console.log('Brand detection test:', brands);

        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
