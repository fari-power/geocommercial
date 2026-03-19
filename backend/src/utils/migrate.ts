import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'geocommercial_db'
    });

    try {
        console.log('🔗 Updating users table schema...');
        try { await connection.query('ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) UNIQUE AFTER email'); } catch (e) { }
        try { await connection.query('ALTER TABLE users ADD COLUMN points_sent INT DEFAULT 0 AFTER password'); } catch (e) { }
        try { await connection.query('ALTER TABLE users ADD COLUMN nb_validated INT DEFAULT 0 AFTER points_sent'); } catch (e) { }
        try { await connection.query('ALTER TABLE users ADD COLUMN nb_rejected INT DEFAULT 0 AFTER nb_validated'); } catch (e) { }

        console.log('🔗 Updating points_de_vente table schema...');
        try { await connection.query('ALTER TABLE points_de_vente ADD COLUMN collecteur_id INT AFTER source'); } catch (e) { }
        try { await connection.query('ALTER TABLE points_de_vente ADD COLUMN collecteur_phone VARCHAR(20) AFTER collecteur_id'); } catch (e) { }

        console.log('✅ Schema updated successfully.');
    } catch (err: any) {
        console.error('❌ Error during migration:', err.message);
    } finally {
        await connection.end();
    }
}

migrate();
