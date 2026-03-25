import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkLocalSchema() {
    try {
        console.log('Connecting to local DB...');
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'geocommercial_db',
            port: 3306,
            connectTimeout: 5000
        });

        console.log('Connected!');

        const [tables]: any = await connection.query('SHOW TABLES');
        console.log('Tables:', tables.map((t: any) => Object.values(t)[0]));

        if (tables.some((t: any) => Object.values(t)[0] === 'users')) {
            const [userCols]: any = await connection.query('DESCRIBE users');
            console.log('Users columns:', userCols.map((c: any) => c.Field));
        } else {
            console.log('Table users not found!');
        }

        if (tables.some((t: any) => Object.values(t)[0] === 'points_de_vente')) {
            const [pvCount]: any = await connection.query('SELECT COUNT(*) as count FROM points_de_vente');
            console.log('Total points:', pvCount[0].count);
        } else {
            console.log('Table points_de_vente not found!');
        }

        await connection.end();
        process.exit(0);
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkLocalSchema();
