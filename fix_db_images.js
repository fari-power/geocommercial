const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

const rules = [
    { match: 'kfc', image: '/uploads/Images%20applications/KFC.png' },
    { match: 'bim', image: '/uploads/Images%20applications/Bim.png' },
    { match: 'marjane', image: '/uploads/Images%20applications/Marjane.png' },
    { match: 'carrefour', image: '/uploads/Images%20applications/Carrefour%20Market.png' },
    { match: 'mcdonald', image: "/uploads/Images%20applications/McDonald's.png" },
    { match: 'pizza hut', image: '/uploads/Images%20applications/Pizza%20Hut.png' },
    { match: 'burger king', image: '/uploads/Images%20applications/FastFood.jpg' },
    { match: 'restaurant', image: '/uploads/Images%20applications/FastFood.jpg' },
    { match: 'fast food', image: '/uploads/Images%20applications/FastFood.jpg' },
    { match: 'café', image: '/uploads/Images%20applications/café.jpg' },
    { match: 'cafe', image: '/uploads/Images%20applications/café.jpg' },
    { match: 'epicerie', image: '/uploads/Images%20applications/Epicerie.png' },
    { match: 'épicerie', image: '/uploads/Images%20applications/Epicerie.png' },
    { match: 'hanout', image: '/uploads/Images%20applications/Epicerie.png' },
    { match: 'hanut', image: '/uploads/Images%20applications/Epicerie.png' },
    { match: 'pharmacie', image: '/uploads/Images%20applications/Pharmacie.jpg' },
    { match: 'parapharmacie', image: '/uploads/Images%20applications/Parapharmacie_jpg.jpg' },
    { match: 'boulangerie', image: '/uploads/Images%20applications/boulangerie.jpg' },
    { match: 'boucherie', image: '/uploads/Images%20applications/charcuterie.jpg' },
];

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'geocommercial_db'
    });

    console.log('Fetching points...');
    const [rows] = await connection.query('SELECT id, nom, categorie, image_url FROM points_de_vente');
    console.log(`Found ${rows.length} points.`);

    let updated = 0;
    for (const point of rows) {
        let bestImage = null;
        const nom = (point.nom || '').toLowerCase();
        const cat = (point.categorie || '').toLowerCase();

        for (const rule of rules) {
            if (nom.includes(rule.match) || cat.includes(rule.match)) {
                bestImage = rule.image;
                break;
            }
        }

        if (bestImage && bestImage !== point.image_url) {
            await connection.query('UPDATE points_de_vente SET image_url = ? WHERE id = ?', [bestImage, point.id]);
            updated++;
        }
    }

    console.log(`Update complete. ${updated} points updated.`);
    await connection.end();
}

run().catch(console.error);
