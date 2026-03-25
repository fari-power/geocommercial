import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        console.log('Connecting to:', process.env.DB_HOST);
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306'),
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false // Less strict for debugging
            } : undefined,
            connectTimeout: 5000
        });

        console.log('Connected!');

        const [tables]: any = await connection.query('SHOW TABLES');
        console.log('Tables:', tables.map((t: any) => Object.values(t)[0]));

        const [pvCount]: any = await connection.query('SELECT COUNT(*) as count FROM points_de_vente');
        console.log(`Total points_de_vente: ${pvCount[0].count}`);

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

check();
