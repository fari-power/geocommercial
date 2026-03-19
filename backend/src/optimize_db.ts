import pool from './config/db.js';

async function addIndex() {
    console.log('🚀 Optimisation de la base de données (Ajout d\'index)...');
    try {
        await pool.query('CREATE INDEX idx_nom_zone ON points_de_vente(nom, zone)');
        console.log('✅ Index créé avec succès !');
        process.exit(0);
    } catch (error: any) {
        if (error.code === 'ER_DUP_KEYNAME') {
            console.log('ℹ️ L\'index existe déjà.');
            process.exit(0);
        }
        console.error('❌ Erreur :', error);
        process.exit(1);
    }
}

addIndex();
