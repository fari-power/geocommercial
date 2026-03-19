import express from 'express';
import { chatWithAI } from '../controllers/chat.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Envoyer un message à l'assistant IA GeoCommercial
 *     description: |
 *       Discutez avec l'assistant IA (Mistral) qui a accès aux statistiques
 *       en temps réel de la base de données GeoCommercial.
 *       
 *       L'IA peut répondre à des questions sur :
 *       - Le nombre de points de vente
 *       - La répartition géographique
 *       - Les tendances de collecte
 *       - Des conseils en géo-marketing
 *       
 *       **Note** : Si la clé API Mistral n'est pas configurée, l'IA fonctionne
 *       en mode local avec des réponses basiques.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatInput'
 *           example:
 *             message: "Combien de points de vente avons-nous à Casablanca ?"
 *             history:
 *               - role: "user"
 *                 content: "Bonjour"
 *               - role: "assistant"
 *                 content: "Bonjour ! Comment puis-je vous aider ?"
 *     responses:
 *       200:
 *         description: Réponse de l'assistant IA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Message manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message requis"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', chatWithAI);

export default router;
