const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkLocal() {
    try {
        console.log('--- CHECKING LOCAL MYSQL ---');
        console.log('Host:', process.env.DB_HOST);
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: 3306,
            connectTimeout: 2000 // Fast timeout
        });

        console.log('SUCCESS: Connection to local MySQL works!');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('FAILED: Cannot connect to local MySQL on 127.0.0.1:3306');
        console.error('Error message:', err.message);
        process.exit(1);
    }
}

checkLocal();
