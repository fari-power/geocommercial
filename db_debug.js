import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

async function debug() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('--- Testing points_de_vente table ---');
        const [pInfo] = await pool.query('DESCRIBE points_de_vente');
        console.log('points_de_vente structure:', pInfo.map(c => c.Field).join(', '));

        console.log('\n--- Testing users table ---');
        const [uInfo] = await pool.query('DESCRIBE users');
        console.log('users structure:', uInfo.map(c => c.Field).join(', '));

        console.log('\n--- Testing JOIN query ---');
        const query = `
            SELECT p.*, u.phone_number as collecteur_phone, u.points_sent as collecteur_points 
            FROM points_de_vente p
            LEFT JOIN users u ON p.collecteur_id = u.id
            WHERE p.statut_validation != "REJETE"
            ORDER BY p.date_collecte DESC 
            LIMIT 50 OFFSET 0
        `;
        const [rows] = await pool.query(query);
        console.log('Rows found:', rows.length);
        if (rows.length > 0) {
            console.log('First row collecteur_phone:', rows[0].collecteur_phone);
        }

    } catch (error) {
        console.error('SQL Error:', error.message);
    } finally {
        await pool.end();
    }
}

debug();
