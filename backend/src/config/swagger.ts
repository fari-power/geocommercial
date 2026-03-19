import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GeoCommercial API',
            version: '1.0.0',
            description: `
## API de Collecte et Gestion des Points de Vente — GeoCommercial

Cette API permet à une **application mobile** de :

- 🔐 **S'authentifier** (login / register) et récupérer un token JWT
- 📍 **Consulter** les points de vente (avec pagination, filtres, recherche)
- ➕ **Ajouter** de nouveaux points de vente depuis le terrain
- 📸 **Uploader** des photos de commerces
- 📊 **Consulter** les statistiques du réseau
- ✅ **Valider/Rejeter** des points en attente
- 🤖 **Discuter** avec l'assistant IA GeoCommercial

### Authentification

- Les routes protégées par **API Key** nécessitent le header \`X-API-KEY\`
- Les routes protégées par **Bearer Auth** nécessitent le header \`Authorization: Bearer <token>\`
            `,
            contact: {
                name: 'GeoCommercial Team',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Serveur local de développement',
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Authentification et gestion des utilisateurs',
            },
            {
                name: 'Points',
                description: 'CRUD des points de vente — Collecte mobile',
            },
            {
                name: 'Stats',
                description: 'Statistiques et tableaux de bord',
            },
            {
                name: 'Chat',
                description: 'Assistant IA GeoCommercial (Mistral)',
            },
            {
                name: 'Vouchers',
                description: 'Bons d\'achat et récompenses des agents',
            },
            {
                name: 'Health',
                description: 'Santé du serveur',
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-KEY',
                    description: 'Clé API pour les opérations d\'écriture (ajout de points, upload d\'images)',
                },
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtenu via /api/auth/login',
                },
            },
            schemas: {
                // ── Point de Vente ──────────────────────
                PointDeVente: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'ID unique du point', example: 1 },
                        nom: { type: 'string', description: 'Nom du commerce', example: 'Hanout El Kheir' },
                        adresse: { type: 'string', description: 'Adresse complète', example: '45 Rue des Lilas, Quartier Oasis' },
                        latitude: { type: 'number', format: 'double', description: 'Latitude GPS', example: 33.5731 },
                        longitude: { type: 'number', format: 'double', description: 'Longitude GPS', example: -7.5898 },
                        categorie: { type: 'string', description: 'Catégorie du commerce', example: 'Epicerie' },
                        type: { type: 'string', enum: ['Formel', 'Informel'], description: 'Type du commerce', example: 'Formel' },
                        zone: { type: 'string', description: 'Zone / Ville', example: 'Casablanca' },
                        image_url: { type: 'string', nullable: true, description: 'URL de l\'image du commerce', example: 'http://localhost:3001/uploads/photo123.jpg' },
                        source: { type: 'string', enum: ['CSV', 'APP_COLLECTE', 'MANUEL'], description: 'Source de la donnée', example: 'APP_COLLECTE' },
                        collecteur_id: { type: 'integer', nullable: true, description: 'ID de l\'agent collecteur' },
                        statut_validation: { type: 'string', enum: ['EN_ATTENTE', 'VALIDE', 'REJETE'], description: 'Statut de validation', example: 'EN_ATTENTE' },
                        date_collecte: { type: 'string', format: 'date-time', description: 'Date de collecte', example: '2026-02-22T21:00:00.000Z' },
                        updated_at: { type: 'string', format: 'date-time', description: 'Date de dernière mise à jour' },
                    },
                },
                // ── Créer un Point ──────────────────────
                CreatePointInput: {
                    type: 'object',
                    required: ['nom', 'adresse', 'latitude', 'longitude'],
                    properties: {
                        nom: { type: 'string', description: 'Nom du commerce', example: 'Hanout El Kheir' },
                        adresse: { type: 'string', description: 'Adresse complète', example: '45 Rue des Lilas, Quartier Oasis' },
                        latitude: { type: 'number', format: 'double', description: 'Latitude GPS', example: 33.5731 },
                        longitude: { type: 'number', format: 'double', description: 'Longitude GPS', example: -7.5898 },
                        categorie: { type: 'string', description: 'Catégorie (Epicerie, Boulangerie, etc.)', example: 'Epicerie' },
                        type: { type: 'string', enum: ['Formel', 'Informel'], description: 'Type du commerce', example: 'Formel' },
                        zone: { type: 'string', description: 'Zone / Ville', example: 'Casablanca' },
                        image_url: { type: 'string', description: 'URL de l\'image (optionnel)', example: 'http://localhost:3001/uploads/photo.jpg' },
                        source: { type: 'string', description: 'Source de la donnée', example: 'APP_COLLECTE', default: 'APP_COLLECTE' },
                    },
                },
                // ── Réponse paginée ─────────────────────
                PaginatedPointsResponse: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PointDeVente' },
                        },
                        total: { type: 'integer', description: 'Nombre total de résultats', example: 1250 },
                        page: { type: 'integer', description: 'Page courante', example: 1 },
                        totalPages: { type: 'integer', description: 'Nombre total de pages', example: 25 },
                    },
                },
                // ── Filtres ─────────────────────────────
                FiltersResponse: {
                    type: 'object',
                    properties: {
                        categories: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Epicerie', 'Boulangerie', 'Café', 'Restaurant'],
                        },
                        zones: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Casablanca', 'Rabat', 'Marrakech', 'Fès'],
                        },
                        types: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Formel', 'Informel'],
                        },
                    },
                },
                // ── Stats ───────────────────────────────
                StatsResponse: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', description: 'Nombre total de points', example: 1250 },
                        byType: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Formel' },
                                    value: { type: 'integer', example: 800 },
                                },
                            },
                        },
                        byCity: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Casablanca' },
                                    value: { type: 'integer', example: 350 },
                                },
                            },
                        },
                        zonesCount: { type: 'integer', description: 'Nombre de zones distinctes', example: 42 },
                        recent: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PointDeVente' },
                            description: 'Derniers points collectés par mobile',
                        },
                        pendingCount: { type: 'integer', description: 'Nombre de points en attente de validation', example: 15 },
                        agentsCount: { type: 'integer', description: 'Nombre d\'agents actifs', example: 3 },
                    },
                },
                // ── Récompenses ─────────────────────────
                Voucher: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 101 },
                        partner: { type: 'string', enum: ['MARJANE', 'CARREFOUR', 'COCACOLA', 'DANONE'], example: 'MARJANE' },
                        code: { type: 'string', example: 'GC-X789AB12' },
                        value: { type: 'number', example: 15.00 },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                // ── Auth ────────────────────────────────
                // ── Auth ────────────────────────────────
                RegisterInput: {
                    type: 'object',
                    required: ['email', 'password', 'name'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'agent@geocommercial.ma' },
                        password: { type: 'string', format: 'password', example: 'motdepasse123' },
                        name: { type: 'string', example: 'Agent Terrain' },
                    },
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'agent@geocommercial.ma' },
                        password: { type: 'string', format: 'password', example: 'motdepasse123' },
                    },
                },
                UserInfo: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', nullable: true, example: 'agent@geocommercial.ma' },
                        phone: { type: 'string', example: '+212612345678' },
                        role: { type: 'string', example: 'agent' },
                        points_sent: { type: 'integer', description: 'Points potentiels (20 x ajoutés)', example: 200 },
                        nb_validated: { type: 'integer', description: 'Nombre de points validés', example: 10 },
                        nb_rejected: { type: 'integer', description: 'Nombre de points rejetés', example: 2 },
                        vouchers: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Voucher' },
                        },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', description: 'JWT Token', example: 'eyJhbGciOiJIUzI1NiIsInR...' },
                        user: { $ref: '#/components/schemas/UserInfo' },
                    },
                },
                // ── Chat ────────────────────────────────
                ChatInput: {
                    type: 'object',
                    required: ['message'],
                    properties: {
                        message: { type: 'string', description: 'Message de l\'utilisateur', example: 'Combien de points de vente avons-nous à Casablanca ?' },
                        history: {
                            type: 'array',
                            description: 'Historique de la conversation',
                            items: {
                                type: 'object',
                                properties: {
                                    role: { type: 'string', enum: ['user', 'assistant'], example: 'user' },
                                    content: { type: 'string', example: 'Bonjour' },
                                },
                            },
                        },
                    },
                },
                ChatResponse: {
                    type: 'object',
                    properties: {
                        content: { type: 'string', description: 'Réponse de l\'IA', example: 'Bonjour ! Nous avons actuellement 350 points de vente à Casablanca.' },
                        isLocal: { type: 'boolean', description: 'True si mode local (pas de clé API Mistral)', example: false },
                    },
                },
                // ── Erreurs ─────────────────────────────
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', description: 'Message d\'erreur', example: 'Erreur serveur' },
                    },
                },
                SuccessMessage: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Opération réussie' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
