import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_FILE_PATH = path.join(__dirname, '../../../public/FichiersCSV/piont de vente maroc.csv');

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'geocommercial_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

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
            statut_validation ENUM('EN_ATTENTE', 'VALIDE', 'REJETE') DEFAULT 'EN_ATTENTE',
            date_collecte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (collecteur_id) REFERENCES users(id)
        );
    `);

    await connection.end();
}

import { normalizeCategory, normalizeZone, normalizeType } from './normalizers.js';

async function importCsv() {
    try {
        console.log('🏗️ Préparation de la base de données...');
        await setupDatabase();

        const { default: pool } = await import('../config/db.js');

        console.log('🧹 Nettoyage des anciennes données...');
        await pool.query('DELETE FROM points_de_vente');

        console.log('⏳ Importation avec nettoyage des catégories...');
        if (!fs.existsSync(CSV_FILE_PATH)) {
            console.error('❌ Fichier introuvable');
            process.exit(1);
        }

        let count = 0;
        const results: any[] = [];

        fs.createReadStream(CSV_FILE_PATH)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`Démarrage du traitement de ${results.length} lignes...`);
                for (const row of results) {
                    try {
                        const rawCat = row.Catégorie || row.Categorie || 'Autre';
                        const nom = row.Nom || 'Sans nom';

                        // Handle potential BOM or case differences
                        let zone = '';
                        for (const key in row) {
                            if (key.toLowerCase().includes('zone')) {
                                zone = row[key];
                                break;
                            }
                        }

                        // Nettoyage catégorie
                        const finalCat = normalizeCategory(rawCat);
                        if (!finalCat) continue; // Skip department store

                        // Nettoyage Zone
                        zone = normalizeZone(zone);

                        const latitude = row.Latitude ? parseFloat(row.Latitude.toString().replace(',', '.')) : null;
                        const longitude = row.Longitude ? parseFloat(row.Longitude.toString().replace(',', '.')) : null;
                        const type = normalizeType(row.Type);

                        await pool.query(
                            'INSERT INTO points_de_vente (nom, adresse, latitude, longitude, categorie, type, zone, source, statut_validation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [nom, row.Adresse || '', (isNaN(latitude as any) ? null : latitude), (isNaN(longitude as any) ? null : longitude), finalCat, type, zone, 'CSV', 'VALIDE']
                        );

                        count++;
                        if (count % 5000 === 0) console.log(`✅ ${count} points traités...`);
                    } catch (err) {
                        console.error('Row process error:', err);
                    }
                }
                console.log(`✨ Terminé ! ${count} points importés avec succès.`);
                process.exit(0);
            });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

importCsv();
