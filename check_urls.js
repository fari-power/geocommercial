const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'geocommercial_db'
    });

    console.log('--- Image URLs in DB ---');
    const [rows] = await connection.query('SELECT nom, categorie, image_url FROM points_de_vente WHERE image_url IS NOT NULL LIMIT 20');
    rows.forEach(r => console.log(`Point: ${r.nom} | Cat: ${r.categorie} | URL: ${r.image_url}`));

    await connection.end();
}
check().catch(console.error);
