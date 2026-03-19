import pool from './config/db.js';

async function check() {
    try {
        const [tables]: any = await pool.query('SHOW TABLES');
        console.log('--- TABLES ACTUELLES ---');
        console.log(tables.map((t: any) => Object.values(t)[0]));

        // Check if vouchers table exists
        const [vouchersTable]: any = await pool.query("SHOW TABLES LIKE 'vouchers'");
        if (vouchersTable.length > 0) {
            console.log('\n✅ La table "vouchers" existe.');
            const [columns]: any = await pool.query('DESCRIBE vouchers');
            console.log('Structure de la table "vouchers":');
            console.log(columns);
        } else {
            console.log('\n❌ La table "vouchers" est MANQUANTE.');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
