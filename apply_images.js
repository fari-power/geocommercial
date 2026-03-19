const mysql = require('mysql2/promise');

async function run() {
    const config = {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'geocommercial_db'
    };

    const pool = mysql.createPool(config);

    const rules = [
        { match: 'kfc', image: '/uploads/Images%20applications/KFC.png' },
        { match: 'bim', image: '/uploads/Images%20applications/Bim.png' },
        { match: 'marjane', image: '/uploads/Images%20applications/Marjane.png' },
        { match: 'carrefour', image: '/uploads/Images%20applications/Carrefour%20Market.png' },
        { match: 'mcdonald', image: '/uploads/Images%20applications/McDonald\'s.png' },
        { match: 'pizza hut', image: '/uploads/Images%20applications/Pizza%20Hut.png' }
    ];

    const catRules = [
        { match: 'restaurant', image: '/uploads/Images%20applications/FastFood.jpg' },
        { match: 'café', image: '/uploads/Images%20applications/café.jpg' },
        { match: 'cafe', image: '/uploads/Images%20applications/café.jpg' },
        { match: 'epicerie', image: '/uploads/Images%20applications/Epicerie.png' },
        { match: 'pharmacie', image: '/uploads/Images%20applications/Pharmacie.jpg' },
        { match: 'boulangerie', image: '/uploads/Images%20applications/boulangerie.jpg' }
    ];

    try {
        console.log('--- STARTING IMAGE ASSIGNMENT ---');

        for (const rule of rules) {
            const [res] = await pool.query(
                "UPDATE points_de_vente SET image_url = ? WHERE LOWER(nom) LIKE ?",
                [rule.image, `%${rule.match}%`]
            );
            console.log(`Updated ${res.affectedRows} points for brand: ${rule.match}`);
        }

        for (const rule of catRules) {
            const [res] = await pool.query(
                "UPDATE points_de_vente SET image_url = ? WHERE LOWER(categorie) LIKE ? AND (image_url IS NULL OR image_url = '')",
                [rule.image, `%${rule.match}%`]
            );
            console.log(`Updated ${res.affectedRows} points for category: ${rule.match}`);
        }

        console.log('--- FINISHED ---');
        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(1);
    }
}

run();
