const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

const rules = [
    { match: 'kfc', image: '/uploads/Images%20applications/KFC.png' },
    { match: 'bim', image: '/uploads/Images%20applications/Bim.png' },
    { match: 'marjane', image: '/uploads/Images%20applications/Marjane.png' },
    { match: 'carrefour', image: '/uploads/Images%20applications/Carrefour%20Market.png' },
    { match: 'mcdonald', image: "/uploads/Images%20applications/McDonald's.png" },
    { match: 'mcdonalds', image: "/uploads/Images%20applications/McDonald's.png" },
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
    { match: 'glacier', image: '/uploads/Images%20applications/Glacier.jpg' },
];

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'geocommercial_db'
        });

        console.log('--- FORCED DB CLEANUP v2 ---');
        const [rows] = await connection.query('SELECT id, nom, categorie, image_url FROM points_de_vente');

        let count = 0;
        for (const point of rows) {
            const nom = (point.nom || '').toLowerCase();
            const cat = (point.categorie || '').toLowerCase();
            const currentImg = point.image_url || '';

            // Clean path if it's broken
            const needsUpdate = currentImg.startsWith('file:///') || !currentImg || currentImg === '' || currentImg.includes('placehold.co');

            let targetImg = null;
            for (const rule of rules) {
                if (nom.includes(rule.match) || cat.includes(rule.match)) {
                    targetImg = rule.image;
                    break;
                }
            }

            if (needsUpdate && targetImg) {
                await connection.query('UPDATE points_de_vente SET image_url = ? WHERE id = ?', [targetImg, point.id]);
                count++;
            }
        }

        console.log(`Updated ${count} points.`);
        await connection.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
