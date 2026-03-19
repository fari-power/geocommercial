import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'geocommercial_db'
    });
    const [zones]: any = await connection.query('SELECT zone, COUNT(*) as count FROM points_de_vente GROUP BY zone ORDER BY zone');
    console.log('LISTE DES ZONES EN BASE:');
    zones.forEach((z: any) => {
        console.log(`${z.zone}: ${z.count}`);
    });
    console.log('NOMBRE TOTAL DE ZONES:', zones.length);
    await connection.end();
}
check();
