const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

const rules = [
    { match: 'kfc', image: '/uploads/Images%20applications/KFC.png' },
    { match: 'bim', image: '/uploads/Images%20applications/Bim.png' },
    { match: 'marjane', image: '/uploads/Images%20applications/Marjane.png' },
    { match: 'carrefour', image: '/uploads/Images%20applications/Carrefour%20Market.png' },
    { match: 'mcdonald', image: "/uploads/Images%20applications/McDonald's.png" },
    { match: 'pizza hut', image: '/uploads/Images%20applications/Pizza%20Hut.png' },
    { match: 'mall', image: '/uploads/Images%20applications/Mall.png' },
    { match: 'market', image: '/uploads/Images%20applications/Market.png' },
    { match: 'pub', image: '/uploads/Images%20applications/Pubs.png' },
    { match: 'superette', image: '/uploads/Images%20applications/Superettes.png' },
    { match: 'supérette', image: '/uploads/Images%20applications/Superettes.png' },
    { match: 'restaurant', image: '/uploads/Images%20applications/Restaurant.png' },
    { match: 'fast food', image: '/uploads/Images%20applications/FastFood.jpg' },
    { match: 'café', image: '/uploads/Images%20applications/café.jpg' },
    { match: 'cafe', image: '/uploads/Images%20applications/café.jpg' },
    { match: 'laiterie', image: '/uploads/Images%20applications/crèmerie.jpg' },
    { match: 'crèmerie', image: '/uploads/Images%20applications/crèmerie.jpg' },
    { match: 'cremerie', image: '/uploads/Images%20applications/crèmerie.jpg' },
    { match: 'epicerie', image: '/uploads/Images%20applications/Epicerie.png' },
    { match: 'épicerie', image: '/uploads/Images%20applications/Epicerie.png' },
    { match: 'hanout', image: '/uploads/Images%20applications/Epicerie.png' },
    { match: 'hanut', image: '/uploads/Images%20applications/Epicerie.png' },
    { match: 'pharmacie', image: '/uploads/Images%20applications/Pharmacie.jpg' },
    { match: 'parapharmacie', image: '/uploads/Images%20applications/Parapharmacie_jpg.jpg' },
    { match: 'boulangerie', image: '/uploads/Images%20applications/boulangerie.jpg' },
    { match: 'boucherie', image: '/uploads/Images%20applications/Boucherie.png' },
    { match: 'charcuterie', image: '/uploads/Images%20applications/charcuterie.jpg' },
    { match: 'grossiste', image: '/uploads/Images%20applications/Grossiste.jpg' },
];

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'geocommercial_db'
        });

        console.log('--- REASSIGNING ALL NEW IMAGE RULES ---');
        const [rows] = await connection.query('SELECT id, nom, categorie, image_url FROM points_de_vente');

        let count = 0;
        for (const point of rows) {
            const nom = (point.nom || '').toLowerCase();
            const cat = (point.categorie || '').toLowerCase();
            const currentImg = point.image_url || '';

            let targetImg = null;
            // First check name (priority)
            for (const rule of rules) {
                if (nom.includes(rule.match)) {
                    targetImg = rule.image;
                    break;
                }
            }
            // Then check category
            if (!targetImg) {
                for (const rule of rules) {
                    if (cat.includes(rule.match)) {
                        targetImg = rule.image;
                        break;
                    }
                }
            }

            // Force update if we have a better rule than a generic or broken path
            const needsUpdate = !currentImg ||
                currentImg.startsWith('file:///') ||
                currentImg.includes('placehold.co') ||
                (targetImg && currentImg.includes('Images%20applications') && currentImg !== targetImg);

            if (targetImg && needsUpdate) {
                await connection.query('UPDATE points_de_vente SET image_url = ? WHERE id = ?', [targetImg, point.id]);
                count++;
            }
        }

        console.log(`Updated ${count} points with new rules.`);
        await connection.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
