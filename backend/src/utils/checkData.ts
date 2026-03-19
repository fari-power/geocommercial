import pool from '../config/db.js';

async function checkData() {
    try {
        const [zones]: any = await pool.query('SELECT zone, COUNT(*) as count FROM points_de_vente GROUP BY zone LIMIT 20');
        console.log('--- EXEMPLE DE ZONES ---');
        console.table(zones);

        const [types]: any = await pool.query('SELECT type, COUNT(*) as count FROM points_de_vente GROUP BY type');
        console.log('--- TYPES TROUVÉS ---');
        console.table(types);

        const [agents]: any = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "agent"');
        console.log('--- AGENTS RÉELS ---');
        console.log(agents[0].count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
