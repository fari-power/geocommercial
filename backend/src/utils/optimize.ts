import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function optimize() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'geocommercial_db'
    });

    try {
        console.log('🔗 Optimizing database with indexes...');
        try { await connection.query('ALTER TABLE points_de_vente ADD INDEX idx_collecteur (collecteur_id)'); } catch (e) { }
        try { await connection.query('ALTER TABLE points_de_vente ADD INDEX idx_status (statut_validation)'); } catch (e) { }
        try { await connection.query('ALTER TABLE points_de_vente ADD INDEX idx_zone (zone)'); } catch (e) { }
        try { await connection.query('ALTER TABLE points_de_vente ADD INDEX idx_cat (categorie)'); } catch (e) { }
        try { await connection.query('ALTER TABLE points_de_vente ADD INDEX idx_phone (collecteur_phone)'); } catch (e) { }
        console.log('✅ Optimization complete.');
    } catch (err: any) {
        console.error('❌ Error during optimization:', err.message);
    } finally {
        await connection.end();
    }
}

optimize();
