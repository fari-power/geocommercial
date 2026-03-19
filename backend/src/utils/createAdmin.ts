import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'geocommercial_db'
    });

    const email = 'admin@geocommercial.com';
    const password = 'password123';

    // Vérifier si l'admin existe déjà
    const [existing]: any = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
        console.log('ℹ️ L\'utilisateur admin existe déjà.');
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'admin']
        );
        console.log('✅ Utilisateur admin créé avec succès !');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Mot de passe: ${password}`);
    }

    await connection.end();
}

createAdmin().catch(console.error);
