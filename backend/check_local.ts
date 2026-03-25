import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkLocal() {
    try {
        console.log('--- CHECKING LOCAL DB ---');
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'geocommercial_db',
            port: 3306,
            connectTimeout: 5000
        });

        console.log('Connected to local DB!');
        const [pvCount]: any = await connection.query('SELECT COUNT(*) as count FROM points_de_vente');
        console.log(`Local points_de_vente: ${pvCount[0].count}`);

        const [userCols]: any = await connection.query('DESCRIBE users');
        console.log('Columns in users:', userCols.map((c: any) => c.Field).join(', '));

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error connecting to local DB:', error);
        process.exit(1);
    }
}

checkLocal();
