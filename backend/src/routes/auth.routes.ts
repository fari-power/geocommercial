import { Router } from 'express';
import { login, register, getMe, requestOTP, verifyOTP, getRanking, getMyVouchers, exchangeVoucher } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { apiKeyMiddleware } from '../middlewares/apiKey.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/request-otp:
 *   post:
 *     summary: Demander un code OTP par SMS (Maroc)
 *     description: |
 *       Envoie un code de confirmation à 6 chiffres par SMS au numéro indiqué.
 *       Le numéro doit être au format 06XXXXXXXX ou +2126XXXXXXXX.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "0612345678"
 *     responses:
 *       200:
 *         description: Code envoyé
 *       500:
 *         description: Erreur serveur
 */
router.post('/request-otp', requestOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Vérifier le code OTP et se connecter
 *     description: |
 *       Vérifie le code reçu par SMS. Si l'utilisateur n'existe pas encore,
 *       il est créé automatiquement en tant qu'agent.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *               - code
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "+212612345678"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le Token JWT
 *       401:
 *         description: Code OTP incorrect ou expiré
 */
router.post('/verify-otp', verifyOTP);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     description: |
 *       Enregistre un nouvel utilisateur (agent terrain ou administrateur).
 *       
 *       **Utilisation mobile** : Appelez cette route pour créer un compte agent
 *       depuis l'application mobile de collecte.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *           example:
 *             email: "agent@geocommercial.ma"
 *             password: "motdepasse123"
 *             name: "Agent Terrain"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé avec succès"
 *                 userId:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cet email est déjà utilisé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter et obtenir un token JWT
 *     description: |
 *       Authentifie un utilisateur et retourne un JWT token valide 24h.
 *       
 *       **Utilisation mobile** : Stockez le token retourné et incluez-le
 *       dans le header `Authorization: Bearer <token>` pour les requêtes protégées.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: "agent@geocommercial.ma"
 *             password: "motdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie — Token JWT retourné
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email ou mot de passe incorrect"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     description: |
 *       Retourne les informations du profil de l'utilisateur authentifié.
 *       
 *       **Utilisation mobile** : Appelez cette route après le login pour vérifier
 *       que le token est valide et afficher les infos de l'utilisateur.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
 */
router.get('/me', authMiddleware, getMe);

/**
 * @swagger
 * /api/auth/ranking:
 *   get:
 *     summary: Classement des agents par points cumulés
 *     description: |
 *       Retourne la liste de tous les agents triés par leurs points cumulés (du plus élevé au plus bas).
 *       Chaque point de vente soumis via l'app rapporte **20 points** à l'agent.
 *       
 *       **Utilisation mobile** : Appelez cette route pour afficher le classement des agents
 *       et la position de l'agent connecté dans le leaderboard.
 *       
 *       Nécessite la clé API dans le header `X-API-KEY`.
 *     tags: [Auth]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Liste des agents classés par points décroissants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 3
 *                   phone_number:
 *                     type: string
 *                     example: "+212612345678"
 *                   email:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                   role:
 *                     type: string
 *                     example: "agent"
 *                   points_sent:
 *                     type: integer
 *                     description: Points cumulés (20 pts par collecte)
 *                     example: 460
 *                   nb_validated:
 *                     type: integer
 *                     description: Nombre de points de vente validés
 *                     example: 23
 *                   nb_rejected:
 *                     type: integer
 *                     description: Nombre de points de vente rejetés
 *                     example: 0
 *       401:
 *         description: Clé API manquante ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erreur serveur
 */
router.get('/ranking', apiKeyMiddleware, getRanking);

/**
 * @swagger
 * /api/auth/vouchers/exchange:
 *   post:
 *     summary: Échanger des points contre un nouveau bon d'achat
 *     description: Permet à un agent d'échanger 5, 10 ou 20 points cumulés contre un bon d'achat.
 *     tags: [Vouchers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cost
 *               - partner
 *             properties:
 *               cost:
 *                 type: integer
 *                 description: "Nombre de points à échanger (ex: 5, 10, 20)"
 *                 example: 10
 *               partner:
 *                 type: string
 *                 description: "Partenaire du bon (MARJANE, CARREFOUR...)"
 *                 example: "MARJANE"
 *     responses:
 *       200:
 *         description: Échange réussi, bon généré
 *       400:
 *         description: Solde insuffisant ou données manquantes
 */
router.post('/vouchers/exchange', authMiddleware, exchangeVoucher);

/**
 * @swagger
 * /api/auth/vouchers:
 *   get:
 *     summary: Récupérer les bons d'achat de l'agent connecté
 *     description: |
 *       Retourne la liste de tous les codes de bons d'achat (Marjane, Carrefour...)
 *       remportés par l'agent.
 *       
 *       **Utilisation mobile** : Appelez cette route pour afficher la liste des
 *       récompenses dans l'onglet "Mes Cadeaux / Profil".
 *     tags: [Vouchers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des bons d'achat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Voucher'
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/vouchers', authMiddleware, getMyVouchers);

export default router;
