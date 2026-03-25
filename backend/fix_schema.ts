import pool from './src/config/db.js';

async function fullSchemaUpdate() {
    try {
        console.log('--- DEBUT MISE A JOUR SCHEMA ---');

        // Check users table
        const [userCols]: any = await pool.query('DESCRIBE users');
        const userFields = userCols.map((c: any) => c.Field);

        const usersToAdd = [
            { name: 'phone_number', type: 'VARCHAR(20) UNIQUE' },
            { name: 'points_sent', type: 'INT DEFAULT 0' },
            { name: 'nb_validated', type: 'INT DEFAULT 0' },
            { name: 'nb_rejected', type: 'INT DEFAULT 0' }
        ];

        for (const col of usersToAdd) {
            if (!userFields.includes(col.name)) {
                console.log(`Adding ${col.name} to users...`);
                await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        // Check points_de_vente
        const [pvCols]: any = await pool.query('DESCRIBE points_de_vente');
        const pvFields = pvCols.map((c: any) => c.Field);

        const pvToAdd = [
            { name: 'collecteur_phone', type: 'VARCHAR(20)' },
            { name: 'is_active', type: 'BOOLEAN DEFAULT 1' }
        ];

        for (const col of pvToAdd) {
            if (!pvFields.includes(col.name)) {
                console.log(`Adding ${col.name} to points_de_vente...`);
                await pool.query(`ALTER TABLE points_de_vente ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        console.log('--- SCHEMA MIS A JOUR ---');
        process.exit(0);
    } catch (err) {
        console.error('Erreur schema update:', err);
        process.exit(1);
    }
}

fullSchemaUpdate();
