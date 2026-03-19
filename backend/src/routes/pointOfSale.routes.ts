import { Router } from 'express';
import { getPoints, getMyPoints, createPoint, getFilters, toggleActive, reassignImages } from '../controllers/pointOfSale.controller.js';
import { getStats, updatePointStatus } from '../controllers/stats.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { apiKeyMiddleware } from '../middlewares/apiKey.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import cloudinary from '../config/cloudinary.js';

const router = Router();

/**
 * @swagger
 * /api/points:
 *   get:
 *     summary: Récupérer la liste des points de vente
 *     description: |
 *       Retourne une liste paginée de points de vente avec possibilité de filtrer
 *       par catégorie, zone, type et recherche textuelle.
 *       
 *       **Utilisation mobile** : Appelez cette route pour afficher la liste des commerces
 *       sur la carte ou dans un listing.
 *     tags: [Points]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page (défaut = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre d'éléments par page (défaut = 50)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle dans le nom, la zone et l'adresse
 *         example: "Casablanca"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie exacte
 *         example: "Epicerie"
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *         description: Filtrer par zone / ville
 *         example: "Casablanca"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Formel, Informel]
 *         description: Filtrer par type de commerce
 *       - in: query
 *         name: export
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Mode export (sans pagination, retourne tous les résultats)
 *     responses:
 *       200:
 *         description: Liste paginée des points de vente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPointsResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getPoints);

/**
 * @swagger
 * /api/points/my-points:
 *   get:
 *     summary: Récupérer mes points de vente collectés + stats cumulées
 *     description: |
 *       Retourne la liste paginée des points de vente collectés par l'agent connecté,
 *       ainsi qu'un résumé de ses statistiques personnelles :
 *       - **points_cumules** : total des points gagnés (20 pts par point collecté validé)
 *       - **nb_valide** : nombre de points validés
 *       - **nb_en_attente** : nombre en attente de validation
 *       - **nb_rejete** : nombre rejetés
 *       - **total_collecte** : total de points soumis (tous statuts confondus)
 *       
 *       **⚡ Route principale pour le tableau de bord de l'application mobile.**
 *     tags: [Points]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDE, REJETE]
 *         description: Filtrer par statut de validation
 *     responses:
 *       200:
 *         description: Points de vente de l'agent + ses stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agent:
 *                   type: object
 *                   description: Statistiques cumulées de l'agent
 *                   properties:
 *                     phone:
 *                       type: string
 *                       example: "+212612345678"
 *                     email:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     role:
 *                       type: string
 *                       example: "agent"
 *                     points_cumules:
 *                       type: integer
 *                       description: Total des points gagnés (20 pts par collecte)
 *                       example: 340
 *                     nb_valide:
 *                       type: integer
 *                       description: Points de vente validés
 *                       example: 15
 *                     nb_en_attente:
 *                       type: integer
 *                       description: Points en attente de validation
 *                       example: 2
 *                     nb_rejete:
 *                       type: integer
 *                       description: Points rejetés
 *                       example: 0
 *                     total_collecte:
 *                       type: integer
 *                       description: Total soumis (validé + attente + rejeté)
 *                       example: 17
 *                 data:
 *                   type: array
 *                   description: Liste paginée des points collectés
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nom:
 *                         type: string
 *                       adresse:
 *                         type: string
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       categorie:
 *                         type: string
 *                       type:
 *                         type: string
 *                       zone:
 *                         type: string
 *                       statut_validation:
 *                         type: string
 *                         enum: [EN_ATTENTE, VALIDE, REJETE]
 *                       date_collecte:
 *                         type: string
 *                         format: date-time
 *                       image_url:
 *                         type: string
 *                         nullable: true
 *                 total:
 *                   type: integer
 *                   example: 17
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Token JWT manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 */
router.get('/my-points', authMiddleware, getMyPoints);

/**
 * @swagger
 * /api/points/filters:
 *   get:
 *     summary: Récupérer les valeurs distinctes pour les filtres
 *     description: |
 *       Retourne les listes de catégories, zones et types disponibles.
 *       
 *       **Utilisation mobile** : Appelez cette route au démarrage pour peupler
 *       les menus déroulants du formulaire de collecte.
 *     tags: [Points]
 *     responses:
 *       200:
 *         description: Valeurs distinctes pour les filtres
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FiltersResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/filters', getFilters);

/**
 * @swagger
 * /api/points/stats:
 *   get:
 *     summary: Récupérer les statistiques globales
 *     description: |
 *       Retourne les statistiques : total de points, répartition par type et par ville,
 *       derniers points collectés, nombre en attente de validation, nombre d'agents.
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Données statistiques
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /api/points/reassign-images:
 *   post:
 *     summary: Réassigner les images de marque et de catégorie
 *     tags: [Points]
 *     responses:
 *       200:
 *         description: Succès
 */
router.post('/reassign-images', reassignImages);

/**
 * @swagger
 * /api/points:
 *   post:
 *     summary: Ajouter un nouveau point de vente
 *     description: |
 *       Crée un nouveau point de vente dans la base de données.
 *       
 *       **⚡ Route principale pour l'application mobile de collecte.**
 *       
 *       L'agent terrain remplit le formulaire sur mobile et envoie les données ici.
 *       Les catégories, zones et types sont automatiquement normalisés côté serveur.
 *     tags: [Points]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePointInput'
 *           examples:
 *             epicerie:
 *               summary: Ajout d'une épicerie
 *               value:
 *                 nom: "Hanout El Kheir"
 *                 adresse: "45 Rue des Lilas, Quartier Oasis"
 *                 latitude: 33.5731
 *                 longitude: -7.5898
 *                 categorie: "Epicerie"
 *                 type: "Formel"
 *                 zone: "Casablanca"
 *                 source: "APP_COLLECTE"
 *             boulangerie:
 *               summary: Ajout d'une boulangerie informelle
 *               value:
 *                 nom: "Boulangerie du Coin"
 *                 adresse: "12 Derb Sidi Ahmed, Médina"
 *                 latitude: 33.9878
 *                 longitude: -6.8481
 *                 categorie: "Boulangerie"
 *                 type: "Informel"
 *                 zone: "Rabat"
 *                 source: "APP_COLLECTE"
 *     responses:
 *       201:
 *         description: Point de vente créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Point de vente ajouté avec succès"
 *                 id:
 *                   type: integer
 *                   description: ID du nouveau point créé
 *                   example: 1251
 *       401:
 *         description: Clé API manquante ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Accès API refusé. Clé X-API-KEY manquante ou invalide."
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', (req, res, next) => {
    // Try JWT first, then API Key for backward compatibility
    const authHeader = req.header('Authorization');
    if (authHeader) {
        return authMiddleware(req, res, next);
    }
    return apiKeyMiddleware(req, res, next);
}, createPoint);

/**
 * @swagger
 * /api/points/upload:
 *   post:
 *     summary: Uploader une image sur Cloudinary
 *     description: |
 *       Upload une photo depuis l'appareil mobile vers **Cloudinary**.
 *       Le fichier est stocké dans le cloud et l'URL sécurisée (HTTPS) de l'image est retournée.
 *       
 *       **Workflow mobile** :
 *       1. L'agent prend une photo du commerce
 *       2. Upload via cette route → récupère `imageUrl` (URL Cloudinary)
 *       3. Envoie `imageUrl` dans le champ `image_url` lors du POST /api/points
 *       
 *       **Stockage** : Les images sont hébergées sur Cloudinary (cloud_name: dzbgljbws)
 *       dans le dossier `geocommercial/`.
 *     tags: [Points]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPEG, PNG, WebP) — Max 5 MB
 *     responses:
 *       200:
 *         description: Image uploadée avec succès sur Cloudinary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   description: URL sécurisée Cloudinary de l'image
 *                   example: "https://res.cloudinary.com/dzbgljbws/image/upload/v1710856000/geocommercial/abc123.jpg"
 *                 publicId:
 *                   type: string
 *                   description: ID public Cloudinary (utile pour suppression future)
 *                   example: "geocommercial/abc123"
 *       400:
 *         description: Aucun fichier envoyé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Aucun fichier téléchargé"
 *       401:
 *         description: Clé API manquante ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Accès API refusé. Clé X-API-KEY manquante ou invalide."
 *       500:
 *         description: Erreur lors de l'upload vers Cloudinary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de l'upload vers Cloudinary"
 */
router.post('/upload', apiKeyMiddleware, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }

    try {
        // Upload buffer to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'geocommercial',
                    resource_type: 'image',
                    transformation: [
                        { width: 800, height: 800, crop: 'limit' }, // Resize max 800x800
                        { quality: 'auto', fetch_format: 'auto' }   // Auto optimize
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file!.buffer);
        });

        res.json({
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error: any) {
        console.error('❌ Erreur Cloudinary upload:', error);
        res.status(500).json({ message: 'Erreur lors de l\'upload vers Cloudinary', error: error.message });
    }
});

/**
 * @swagger
 * /api/points/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut de validation d'un point
 *     description: |
 *       Permet de valider ou rejeter un point de vente collecté.
 *       
 *       Valeurs possibles pour `status` :
 *       - `VALIDE` — Le point est confirmé et validé
 *       - `REJETE` — Le point est rejeté
 *       - `EN_ATTENTE` — Remettre en attente
 *     tags: [Points]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du point de vente
 *         example: 42
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [EN_ATTENTE, VALIDE, REJETE]
 *                 description: Nouveau statut de validation
 *                 example: "VALIDE"
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Point valide avec succès"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/status', updatePointStatus);

/**
 * @swagger
 * /api/points/{id}/toggle-active:
 *   patch:
 *     summary: Activer ou désactiver un point de vente
 *     description: |
 *       Permet de masquer (désactiver) ou afficher (activer) un point de vente
 *       dans les résultats sans le supprimer définitivement.
 *     tags: [Points]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du point de vente
 *         example: 42
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 description: true = visible, false = masqué
 *                 example: false
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Point désactivé avec succès"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/toggle-active', toggleActive);

export default router;
