import pool from './config/db.js';

async function cleanDuplicates() {
    console.log('🚀 Début du nettoyage des doublons...');
    
    try {
        // Cette requête SQL identifie les doublons (même nom, zone et coordonnées)
        // et ne garde que l'entrée avec l'ID le plus petit pour chaque groupe.
        const query = `
            DELETE p1 FROM points_de_vente p1
            INNER JOIN points_de_vente p2 
            ON p1.nom = p2.nom 
            AND p1.zone = p2.zone 
            AND p1.id > p2.id
        `;

        console.log('⏳ Recherche et suppression des doublons en cours (cela peut prendre quelques secondes)...');
        const [result]: any = await pool.query(query);
        console.log(`✅ Nettoyage terminé !`);
        console.log(`🗑️ Nombre de doublons supprimés : ${result.affectedRows}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage :', error);
        process.exit(1);
    }
}

cleanDuplicates();
