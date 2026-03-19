import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT || '3306'),
        ssl: process.env.DB_SSL === 'true' ? {
            rejectUnauthorized: true
        } : undefined,
    });

    console.log('🔗 Connexion au serveur MySQL réussie.');

    const dbName = process.env.DB_NAME || 'geocommercial_db';

    // Création de la base de données
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Base de données "${dbName}" créée ou déjà existante.`);

    await connection.query(`USE \`${dbName}\`;`);

    // Table Users
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) DEFAULT NULL UNIQUE,
            phone_number VARCHAR(20) UNIQUE,
            password VARCHAR(255),
            role VARCHAR(20) DEFAULT 'user',
            points_sent INT DEFAULT 0,
            nb_validated INT DEFAULT 0,
            nb_rejected INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    // Fix existing rows: convert empty-string emails to NULL so they don't collide on UNIQUE
    await connection.query(`UPDATE users SET email = NULL WHERE email = '';`);
    // Alter existing column to allow NULL default (CREATE TABLE IF NOT EXISTS won't modify existing columns)
    await connection.query(`ALTER TABLE users MODIFY COLUMN email VARCHAR(255) DEFAULT NULL;`);
    console.log('✅ Table "users" prête.');

    // Table OTP Requests
    await connection.query(`
        CREATE TABLE IF NOT EXISTS otp_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone_number VARCHAR(20) NOT NULL,
            code VARCHAR(6) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✅ Table "otp_requests" prête.');

    // Table Vouchers (Bons d'achat)
    await connection.query(`
        CREATE TABLE IF NOT EXISTS vouchers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            partner ENUM('MARJANE', 'CARREFOUR', 'COCACOLA', 'DANONE') NOT NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            value DECIMAL(10, 2) DEFAULT 15.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
    console.log('✅ Table "vouchers" prête.');

    // Table Points de Vente (Mise à jour pour inclure is_active si absent)
    await connection.query(`
        CREATE TABLE IF NOT EXISTS points_de_vente (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255),
            adresse TEXT,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            categorie VARCHAR(100),
            type VARCHAR(50), 
            zone VARCHAR(100),
            image_url VARCHAR(255),
            source VARCHAR(50) DEFAULT 'CSV',
            collecteur_id INT,
            collecteur_phone VARCHAR(20),
            statut_validation ENUM('EN_ATTENTE', 'VALIDE', 'REJETE') DEFAULT 'EN_ATTENTE',
            is_active BOOLEAN DEFAULT 1,
            date_collecte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (collecteur_id) REFERENCES users(id)
        );
    `);
    console.log('✅ Table "points_de_vente" prête.');

    await connection.end();
    console.log('🚀 Initialisation terminée !');
}

initDb().catch((err) => {
    console.error('❌ Erreur lors de l\'initialisation :', err);
    process.exit(1);
});
