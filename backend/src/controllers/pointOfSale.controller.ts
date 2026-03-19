import { Request, Response } from 'express';
import pool from '../config/db.js';
import { normalizeCategory, normalizeZone, normalizeType } from '../utils/normalizers.js';
import { getDefaultImage } from '../utils/imageMapper.js';

/**
 * Récupérer les points de vente collectés par l'utilisateur connecté + ses stats cumulées
 */
export const getMyPoints = async (req: any, res: Response) => {
    const userId = req.user?.id;
    const userPhone = req.user?.phone;

    if (!userId && !userPhone) {
        return res.status(401).json({ message: 'Authentification requise' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string || '';

    try {
        // Construire la condition sur l'identité de l'agent
        const agentCondition = userId
            ? '(p.collecteur_id = ? OR (p.collecteur_id IS NULL AND p.collecteur_phone = ?))'
            : 'p.collecteur_phone = ?';
        const agentParams: any[] = userId ? [userId, userPhone] : [userPhone];

        let whereClauses = [agentCondition];
        let params: any[] = [...agentParams];

        if (status) {
            whereClauses.push('p.statut_validation = ?');
            params.push(status);
        }

        // Exigence: Les points rejetés disparaissent (ne sont plus comptés ni affichés) après 2 jours
        whereClauses.push('(p.statut_validation != "REJETE" OR p.statut_validation IS NULL OR (p.statut_validation = "REJETE" AND p.updated_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)))');

        const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

        // Points de vente avec pagination
        const [rows]: any = await pool.query(
            `SELECT p.id, p.nom, p.adresse, p.latitude, p.longitude, p.categorie,
                    p.type, p.zone, p.source, p.statut_validation, p.date_collecte,
                    p.image_url, p.collecteur_phone
             FROM points_de_vente p
             ${whereSql}
             ORDER BY p.date_collecte DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // Total count
        const [totalResult]: any = await pool.query(
            `SELECT COUNT(*) as count FROM points_de_vente p ${whereSql}`,
            params
        );

        // Stats cumulées de l'agent
        const [userStats]: any = await pool.query(
            'SELECT points_sent, nb_validated, nb_rejected, phone_number, email, role FROM users WHERE id = ?',
            [userId]
        );

        // Comptages détaillés depuis les points
        const [countByStatus]: any = await pool.query(
            `SELECT p.statut_validation, COUNT(*) as count
             FROM points_de_vente p
             WHERE ${agentCondition} AND (p.statut_validation != "REJETE" OR p.statut_validation IS NULL OR (p.statut_validation = "REJETE" AND p.updated_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)))
             GROUP BY p.statut_validation`,
            agentParams
        );

        const statusMap: Record<string, number> = {
            EN_ATTENTE: 0,
            VALIDE: 0,
            REJETE: 0
        };
        countByStatus.forEach((row: any) => {
            if (row.statut_validation) statusMap[row.statut_validation] = Number(row.count);
        });

        const agent = userStats[0] || {};

        res.json({
            agent: {
                phone: agent.phone_number || userPhone,
                email: agent.email || null,
                role: agent.role || 'agent',
                points_cumules: agent.points_sent || 0,
                nb_valide: statusMap['VALIDE'],
                nb_en_attente: statusMap['EN_ATTENTE'],
                nb_rejete: statusMap['REJETE'],
                total_collecte: (statusMap['VALIDE'] + statusMap['EN_ATTENTE'] + statusMap['REJETE'])
            },
            data: rows,
            total: totalResult[0].count,
            page,
            totalPages: Math.ceil(totalResult[0].count / limit)
        });
    } catch (error) {
        console.error('Erreur getMyPoints:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const getPoints = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const category = req.query.category as string || '';
    const zone = req.query.zone as string || '';
    const type = req.query.type as string || '';
    const status = req.query.status as string || ''; // New filter for validation status
    const phone = req.query.phone as string || '';
    const exportMode = req.query.export === 'true';

    try {
        let whereClauses = [];
        let params: any[] = [];

        if (search) {
            whereClauses.push('(p.nom LIKE ? OR p.zone LIKE ? OR p.adresse LIKE ? OR p.collecteur_phone LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (category) {
            whereClauses.push('categorie = ?');
            params.push(category);
        }

        if (zone) {
            whereClauses.push('zone = ?');
            params.push(zone);
        }

        if (type) {
            whereClauses.push('type = ?');
            params.push(type);
        }

        if (status) {
            if (status === 'COLLECTE') {
                whereClauses.push('(p.collecteur_id IS NOT NULL OR p.collecteur_phone IS NOT NULL)');
            } else {
                whereClauses.push('p.statut_validation = ?');
                params.push(status);
            }

            // Exigence: Les points rejetés disparaissent après 2 jours
            if (status === 'REJETE') {
                whereClauses.push('p.updated_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)');
            }
        } else {
            // By default (Explorer Tout), do not show REJETE points, but show EN_ATTENTE or NULL
            whereClauses.push('(p.statut_validation != "REJETE" OR p.statut_validation IS NULL)');
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        if (exportMode) {
            // No limit for export
            const [rows] = await pool.query(
                `SELECT p.nom, p.adresse, p.latitude, p.longitude, p.categorie, p.type, p.zone, p.source, p.date_collecte 
                 FROM points_de_vente p 
                 LEFT JOIN users u ON p.collecteur_id = u.id
                 ${whereSql} 
                 ORDER BY p.date_collecte DESC`,
                params
            );
            return res.json(rows);
        }

        // Query for data
        const [rows] = await pool.query(
            `SELECT p.*, 
                    COALESCE(p.collecteur_phone, u.phone_number) as display_phone, 
                    u.points_sent as collecteur_points 
             FROM points_de_vente p
             LEFT JOIN users u ON p.collecteur_id = u.id
             ${whereSql} 
             ORDER BY p.date_collecte DESC 
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // Query for total count
        const [total]: any = await pool.query(
            `SELECT COUNT(*) as count 
             FROM points_de_vente p
             LEFT JOIN users u ON p.collecteur_id = u.id
             ${whereSql}`,
            params
        );

        res.json({
            data: rows,
            total: total[0].count,
            page,
            totalPages: Math.ceil(total[0].count / limit)
        });
    } catch (error: any) {
        console.error('Erreur récupération points:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const getFilters = async (req: Request, res: Response) => {
    try {
        const [categories]: any = await pool.query('SELECT DISTINCT categorie FROM points_de_vente WHERE categorie IS NOT NULL ORDER BY categorie');
        const [zones]: any = await pool.query('SELECT DISTINCT zone FROM points_de_vente WHERE zone IS NOT NULL AND zone != "" ORDER BY zone');
        const [types]: any = await pool.query('SELECT DISTINCT type FROM points_de_vente WHERE type IS NOT NULL ORDER BY type');

        res.json({
            categories: categories.map((c: any) => c.categorie),
            zones: zones.map((z: any) => z.zone),
            types: types.map((t: any) => t.type)
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des filtres' });
    }
}

export const createPoint = async (req: any, res: Response) => {
    const { nom, adresse, latitude, longitude, categorie, type, zone, image_url, source, phone } = req.body;
    const userId = req.user?.id; // Récupéré via authMiddleware si présent
    const userPhone = req.user?.phone || phone; // Utilise le tel de l'auth ou du body

    try {
        const finalCat = normalizeCategory(categorie);
        const finalZone = normalizeZone(zone);
        const finalType = normalizeType(type);
        const finalSource = source || 'APP_COLLECTE';
        const validationStatus = (finalSource === 'APP_COLLECTE' || finalSource === 'APP') ? 'EN_ATTENTE' : 'VALIDE';

        // --- VÉRIFICATION DES DOUBLONS PLUS PRÉCISE ---
        // On ne bloque que si le Nom, la Zone ET les Coordonnées sont identiques
        const [existing]: any = await pool.query(
            'SELECT id FROM points_de_vente WHERE nom = ? AND zone = ? AND latitude = ? AND longitude = ? LIMIT 1',
            [nom, finalZone, latitude, longitude]
        );

        if (existing.length > 0) {
            return res.status(200).json({
                message: 'Ce point de vente existe déjà (doublon exact)',
                id: existing[0].id,
                isDuplicate: true
            });
        }
        // ----------------------------------------------

        // Attribution automatique d'image si absente
        let finalImage = image_url;
        if (!finalImage) {
            finalImage = getDefaultImage(nom, finalCat);
        }

        const [result] = await pool.query(
            'INSERT INTO points_de_vente (nom, adresse, latitude, longitude, categorie, type, zone, image_url, source, collecteur_id, collecteur_phone, statut_validation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nom, adresse, latitude, longitude, finalCat, finalType, finalZone, finalImage, finalSource, userId, userPhone, validationStatus]
        );

        res.status(201).json({
            message: 'Point de vente ajouté avec succès (En attente de validation)',
            id: (result as any).insertId,
            points_added: 0 // Les points seront attribués à la validation
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du point:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout' });
    }
};

export const toggleActive = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { is_active } = req.body;

    try {
        await pool.query('UPDATE points_de_vente SET is_active = ? WHERE id = ?', [is_active, id]);
        res.json({ message: `Point ${is_active ? 'activé' : 'désactivé'} avec succès` });
    } catch (error) {
        console.error('Erreur toggle active:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
};

export const reassignImages = async (req: Request, res: Response) => {
    try {
        console.log('🚀 Début de la réassignation forcée des images via API...');

        const [rows]: any = await pool.query('SELECT id, nom, categorie, image_url FROM points_de_vente');

        let count = 0;
        for (const point of rows) {
            const currentImg = point.image_url || '';
            const newImage = getDefaultImage(point.nom, point.categorie);

            if (!newImage) continue;

            const isDefaultImg = currentImg.includes('Images applications');
            // On force le rafraîchissement pour toutes les grandes marques et types importants
            const isPriority = /kfc|bim|marjane|carrefour|mcdonald|pizza hut|mall|market|pub|superette|supérette|laiterie|boucherie|restaurant/i.test(point.nom || '')
                || /mall|market|pub|superette|supérette|laiterie|boucherie|restaurant/i.test(point.categorie || '');

            if (!currentImg || isDefaultImg || isPriority) {
                if (newImage !== currentImg) {
                    await pool.query('UPDATE points_de_vente SET image_url = ? WHERE id = ?', [newImage, point.id]);
                    count++;
                }
            }
        }

        console.log(`✅ Réassignation terminée. ${count} points mis à jour.`);
        res.json({ message: 'Images réassignées avec succès', updated: count });
    } catch (error: any) {
        console.error('Erreur reassignImages:', error);
        res.status(500).json({ message: error.message });
    }
};
