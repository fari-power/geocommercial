import pool from './config/db.js';

async function resetAgents() {
    console.log('🔄 Réinitialisation des scores des agents...');
    try {
        const [result]: any = await pool.query(
            'UPDATE users SET points_sent = 0, nb_validated = 0, nb_rejected = 0'
        );
        console.log(`✅ Les scores de tous les agents ont été remis à zéro ! (${result.affectedRows} comptes impactés)`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation :', error);
        process.exit(1);
    }
}

resetAgents();
