import pool from './src/config/db.js';
import fs from 'fs';
import path from 'path';

async function exportDatabase() {
    try {
        console.log('🔄 Début de l\'exportation de la base de données locale...');
        const [tablesDetails]: any = await pool.query('SHOW TABLES');
        const tables = tablesDetails.map((t: any) => Object.values(t)[0]);

        let sqlDump = `-- Sauvegarde de la base GeoCommercial\n-- Date: ${new Date().toISOString()}\n\n`;

        // Désactiver temporairement la vérification des clés étrangères pour l'import
        sqlDump += 'SET FOREIGN_KEY_CHECKS=0;\n\n';

        for (const table of tables) {
            console.log(`Exportation de la table: ${table}`);
            
            // 1. Structure de la table
            const [createTableRes]: any = await pool.query(`SHOW CREATE TABLE ${table}`);
            const createTableSql = createTableRes[0]['Create Table'];
            sqlDump += `-- Structure de la table ${table}\n`;
            sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
            sqlDump += `${createTableSql};\n\n`;

            // 2. Données de la table
            const [rows]: any = await pool.query(`SELECT * FROM ${table}`);
            if (rows.length > 0) {
                sqlDump += `-- Données de la table ${table}\n`;
                for (const row of rows) {
                    const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
                    const values = Object.values(row).map(v => {
                        if (v === null) return 'NULL';
                        if (typeof v === 'string') return `'${v.replace(/'/g, "''").replace(/\n/g, '\\n')}'`;
                        if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        return v;
                    }).join(', ');
                    sqlDump += `INSERT INTO \`${table}\` (${keys}) VALUES (${values});\n`;
                }
                sqlDump += '\n';
            }
        }

        sqlDump += 'SET FOREIGN_KEY_CHECKS=1;\n';

        const exportPath = path.join(process.cwd(), 'geocommercial_backup.sql');
        fs.writeFileSync(exportPath, sqlDump);

        console.log('\n✅ SUCCÈS ! La base de données a été sauvegardée avec succès.');
        console.log(`📁 Fichier créé : ${exportPath}`);
        console.log(`Vous pourrez utiliser ce fichier pour restaurer votre base de données sur Aiven ou Render.`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error);
        process.exit(1);
    }
}

exportDatabase();
