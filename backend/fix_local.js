const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function fix() {
    let connection;
    try {
        console.log('Connecting to local MySQL...');
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'geocommercial_db',
            port: 3306
        });

        console.log('Connected!');

        // Check users
        const [userCols] = await connection.query('DESCRIBE users');
        const userFields = userCols.map(c => c.Field);
        
        const usersToAdd = [
            { name: 'phone_number', type: 'VARCHAR(20) UNIQUE' },
            { name: 'points_sent', type: 'INT DEFAULT 0' },
            { name: 'nb_validated', type: 'INT DEFAULT 0' },
            { name: 'nb_rejected', type: 'INT DEFAULT 0' }
        ];

        for (const col of usersToAdd) {
            if (!userFields.includes(col.name)) {
                console.log(`Adding ${col.name} to users...`);
                await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        // Check points_de_vente
        const [pvCols] = await connection.query('DESCRIBE points_de_vente');
        const pvFields = pvCols.map(c => c.Field);

        if (!pvFields.includes('collecteur_phone')) {
            console.log('Adding collecteur_phone to points_de_vente...');
            await connection.query('ALTER TABLE points_de_vente ADD COLUMN collecteur_phone VARCHAR(20)');
        }
        
        if (!pvFields.includes('is_active')) {
             console.log('Adding is_active to points_de_vente...');
             await connection.query('ALTER TABLE points_de_vente ADD COLUMN is_active BOOLEAN DEFAULT 1');
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

fix();
