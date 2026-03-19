const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'geocommercial_db'
        });

        console.log('--- Scanning DB for image URLs ---');
        const [rows] = await pool.query('SELECT id, nom, image_url, categorie FROM points_de_vente WHERE image_url IS NOT NULL LIMIT 20');
        console.log(JSON.stringify(rows, null, 2));

        await pool.end();
    } catch (e) {
        console.error(e);
    }
}
check();
