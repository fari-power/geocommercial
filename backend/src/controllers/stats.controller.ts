import { Request, Response } from 'express';
import pool from '../config/db.js';

export const getStats = async (req: Request, res: Response) => {
    try {
        // Ignorer les points REJETE du compte total
        const [total]: any = await pool.query('SELECT COUNT(*) as count FROM points_de_vente WHERE statut_validation != "REJETE" OR statut_validation IS NULL');

        // Distribution by Type (For Pie Chart)
        const [byType]: any = await pool.query('SELECT type as name, COUNT(*) as value FROM points_de_vente WHERE is_active = 1 AND (statut_validation != "REJETE" OR statut_validation IS NULL) GROUP BY type');

        // History of collected points with full date and time - Cumulative Evolution
        const [history]: any = await pool.query(`
            SELECT 
                date_collecte as date, 
                COUNT(*) OVER (ORDER BY date_collecte) as count 
            FROM points_de_vente 
            WHERE date_collecte >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              AND source != "CSV"
              AND statut_validation = "VALIDE"
            ORDER BY date_collecte ASC
        `);

        // Top Cities by count (For Bar Chart)
        const [byCity]: any = await pool.query(`
            SELECT zone as name, COUNT(*) as value 
            FROM points_de_vente 
            WHERE zone IS NOT NULL AND zone != "" AND zone != "Autre" AND (statut_validation != "REJETE" OR statut_validation IS NULL)
            GROUP BY zone 
            ORDER BY value DESC 
            LIMIT 10
        `);

        // Distinct zones total
        const [zones]: any = await pool.query('SELECT COUNT(DISTINCT zone) as count FROM points_de_vente WHERE zone IS NOT NULL AND zone != "" AND zone != "Autre" AND (statut_validation != "REJETE" OR statut_validation IS NULL)');

        // Recent points from mobile app
        const [recent]: any = await pool.query('SELECT * FROM points_de_vente WHERE source != "CSV" AND (statut_validation != "REJETE" OR statut_validation IS NULL) ORDER BY date_collecte DESC LIMIT 8');

        // Pending approval
        const [pending]: any = await pool.query('SELECT COUNT(*) as count FROM points_de_vente WHERE statut_validation = "EN_ATTENTE"');

        // Real agent count
        const [agents]: any = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "agent"');

        // --- NEW: Distribution by Source (EXCLUDING CSV) ---
        const [bySource]: any = await pool.query(`
            SELECT 
                CASE 
                    WHEN source = 'PC_DISTANT' THEN 'Autre PC (Sync)'
                    ELSE 'Application App'
                END as name,
                COUNT(*) as value
            FROM points_de_vente
            WHERE (statut_validation != "REJETE" OR statut_validation IS NULL)
            AND source != 'CSV'
            GROUP BY name
        `);

        res.json({
            total: total[0].count,
            byType, // Formel vs Informel
            byCity, // Top 10 cities
            bySource, // NEW: Only PC vs APP
            history, // Time series data
            zonesCount: zones[0].count,
            recent,
            pendingCount: pending[0].count,
            agentsCount: agents[0].count || 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
    }
};

export const updatePointStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // VALIDE, REJETE, EN_ATTENTE

    try {
        // 1. Récupérer l'ID/Téléphone du collecteur avant la mise à jour
        const [points]: any = await pool.query('SELECT collecteur_id, collecteur_phone, statut_validation FROM points_de_vente WHERE id = ?', [id]);
        if (points.length === 0) return res.status(404).json({ message: 'Point non trouvé' });

        const { collecteur_id, collecteur_phone, statut_validation: oldStatus } = points[0];

        // 2. Mettre à jour le statut du point
        if (status === 'REJETE') {
            await pool.query('UPDATE points_de_vente SET statut_validation = ?, is_active = 0 WHERE id = ?', [status, id]);
        } else {
            await pool.query('UPDATE points_de_vente SET statut_validation = ?, is_active = 1 WHERE id = ?', [status, id]);
        }

        // 3. Mettre à jour les compteurs de l'utilisateur si c'est un agent
        // On effectue la maj si on a un ID ou un téléphone
        if ((collecteur_id || collecteur_phone) && oldStatus !== status) {

            // Helper function pour mettre à jour l'utilisateur via ID ou PHONE
            const updateUserStats = async (querySet: string) => {
                if (collecteur_id) {
                    await pool.query(`UPDATE users SET ${querySet} WHERE id = ?`, [collecteur_id]);
                } else if (collecteur_phone) {
                    await pool.query(`UPDATE users SET ${querySet} WHERE phone_number = ?`, [collecteur_phone]);
                }
            };

            // Décrémenter l'ancien compteur si nécessaire
            if (oldStatus === 'VALIDE') {
                await updateUserStats('nb_validated = GREATEST(0, nb_validated - 1), points_sent = GREATEST(0, points_sent - 20)');
            }
            if (oldStatus === 'REJETE') {
                await updateUserStats('nb_rejected = GREATEST(0, nb_rejected - 1)');
            }

            // Incrémenter le nouveau compteur
            if (status === 'VALIDE') {
                await updateUserStats('nb_validated = nb_validated + 1, points_sent = points_sent + 20');

                // Vérifier si un nouveau bon d'achat doit être émis (tous les 10 points validés)
                // Seulement si on a le collecteur_id pour attribuer le voucher
                if (collecteur_id) {
                    const [userData]: any = await pool.query('SELECT nb_validated FROM users WHERE id = ?', [collecteur_id]);
                    const nbValide = userData[0].nb_validated;

                    if (nbValide > 0 && nbValide % 10 === 0) {
                        const partners = ['MARJANE', 'CARREFOUR', 'COCACOLA', 'DANONE'];
                        const randomPartner = partners[Math.floor(Math.random() * partners.length)];
                        const voucherCode = `GC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

                        await pool.query(
                            'INSERT INTO vouchers (user_id, partner, code, value) VALUES (?, ?, ?, 15.00)',
                            [collecteur_id, randomPartner, voucherCode]
                        );
                        console.log(`🎁 Bon d'achat émis pour l'utilisateur ${collecteur_id} (Milestone ${nbValide})`);
                    }
                }
            }
            if (status === 'REJETE') {
                await updateUserStats('nb_rejected = nb_rejected + 1');
            }
        }

        res.json({ message: `Point ${status.toLowerCase()} avec succès` });
    } catch (error) {
        console.error('Erreur updatePointStatus:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
};
