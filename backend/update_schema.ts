import pool from './src/config/db';

async function updateSchema() {
    try {
        console.log('Checking for is_active column...');
        const [columns]: any = await pool.query('SHOW COLUMNS FROM points_de_vente LIKE "is_active"');

        if (columns.length === 0) {
            console.log('Adding is_active column...');
            await pool.query('ALTER TABLE points_de_vente ADD COLUMN is_active BOOLEAN DEFAULT 1');
            console.log('Column is_active added successfully.');
        } else {
            console.log('Column is_active already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
