import pool from './src/config/db.js';

async function check() {
    try {
        console.log('--- Table points_de_vente ---');
        const [pvCols]: any = await pool.query('DESCRIBE points_de_vente');
        console.table(pvCols);

        console.log('\n--- Table users ---');
        const [userCols]: any = await pool.query('DESCRIBE users');
        console.table(userCols);

        const [pvCount]: any = await pool.query('SELECT COUNT(*) as count FROM points_de_vente');
        console.log(`\nTotal points_de_vente: ${pvCount[0].count}`);

        const [userCount]: any = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log(`Total users: ${userCount[0].count}`);

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

check();
