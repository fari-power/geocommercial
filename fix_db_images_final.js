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

        console.log('--- FORCED DB CLEANUP ---');
        const [rows] = await connection.query('SELECT id, nom, categorie, image_url FROM points_de_vente');
        console.log(`Processing ${rows.length} points...`);

        let forcedCount = 0;
        for (const point of rows) {
            const nom = (point.nom || '').toLowerCase();
            const cat = (point.categorie || '').toLowerCase();
            const currentImg = point.image_url || '';

            // Check if it's an invalid path (Android file picker path)
            const isInvalidPath = currentImg.startsWith('file:///');

            let bestImage = null;
            // High priority: Brands
            const brands = ['kfc', 'bim', 'marjane', 'carrefour', 'mcdonald', 'pizza hut', 'burger king'];
            for (const rule of rules) {
                if (brands.includes(rule.match) && nom.includes(rule.match)) {
                    bestImage = rule.image;
                    break;
                }
            }

            // Medium priority: Category keywords in name or category field
            if (!bestImage) {
                for (const rule of rules) {
                    if (nom.includes(rule.match) || cat.includes(rule.match)) {
                        bestImage = rule.image;
                        break;
                    }
                }
            }

            // We update IF:
            // 1. Path is invalid (file:///)
            // 2. We found a better match and current is empty or placeholder
            const currentIsPlaceholder = currentImg === '' || currentImg.includes('placehold.co');

            if (isInvalidPath || (bestImage && (currentIsPlaceholder || !currentImg.includes('Images%20applications')))) {
                if (bestImage && bestImage !== currentImg) {
                    await connection.query('UPDATE points_de_vente SET image_url = ? WHERE id = ?', [bestImage, point.id]);
                    forcedCount++;
                }
            }
        }

        console.log(`Done! Forced update on ${forcedCount} points.`);
        await connection.end();
        process.exit(0);
    } catch (e) {
        console.error('Update failed:', e);
        process.exit(1);
    }
}

run();
