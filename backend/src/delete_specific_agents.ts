import pool from './config/db.js';

async function run() {
    try {
        const [users]: any = await pool.query('SELECT id, phone_number FROM users');
        console.log('--- AGENTS ACTUELS ---');
        console.log(users);

        const toDelete = ['6000000000', '6317430211', '6325288588'];
        let deleted = 0;

        for (const phone of toDelete) {
            // Check raw, then +212 version
            const query = "DELETE FROM users WHERE phone_number = ? OR phone_number LIKE ?";
            const [res]: any = await pool.query(query, [phone, `%${phone}%`]);
            deleted += res.affectedRows;
        }

        console.log(`\n✅ Terminé ! ${deleted} agents supprimés.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
