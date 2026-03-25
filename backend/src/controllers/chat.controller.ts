import { Request, Response } from 'express';
import { Mistral } from '@mistralai/mistralai';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const getMistralClient = () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) return null;
    return new Mistral({ apiKey });
};

/**
 * Build a rich data context from the database so the AI can answer
 * virtually any question about the dataset without telling the user
 * to "go check the database".
 */
async function buildDataContext(userMessage: string): Promise<string> {
    const sections: string[] = [];

    // ── 1. Global stats ──
    const [globalStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN type = 'Formel' THEN 1 ELSE 0 END) as formel,
            SUM(CASE WHEN type = 'Informel' THEN 1 ELSE 0 END) as informel,
            COUNT(DISTINCT zone) as nb_villes,
            COUNT(DISTINCT categorie) as nb_categories
        FROM points_de_vente
    `);
    const g = globalStats[0];
    sections.push(`## Statistiques globales
- Total points de vente : ${g.total}
- Formel : ${g.formel}
- Informel : ${g.informel}
- Nombre de villes : ${g.nb_villes}
- Nombre de catégories : ${g.nb_categories}`);

    // ── 2. Breakdown by category ──
    const [byCategory]: any = await pool.query(`
        SELECT categorie, COUNT(*) as nb, 
               SUM(CASE WHEN type='Formel' THEN 1 ELSE 0 END) as formel,
               SUM(CASE WHEN type='Informel' THEN 1 ELSE 0 END) as informel
        FROM points_de_vente 
        GROUP BY categorie 
        ORDER BY nb DESC
    `);
    let catTable = '## Répartition par catégorie\n| Catégorie | Total | Formel | Informel |\n|-----------|-------|--------|----------|\n';
    for (const row of byCategory) {
        catTable += `| ${row.categorie} | ${row.nb} | ${row.formel} | ${row.informel} |\n`;
    }
    sections.push(catTable);

    // ── 3. Top 30 cities ──
    const [byCity]: any = await pool.query(`
        SELECT zone, COUNT(*) as nb,
               SUM(CASE WHEN type='Formel' THEN 1 ELSE 0 END) as formel,
               SUM(CASE WHEN type='Informel' THEN 1 ELSE 0 END) as informel
        FROM points_de_vente 
        WHERE zone IS NOT NULL AND zone != '' AND zone != 'Autre'
        GROUP BY zone 
        ORDER BY nb DESC 
        LIMIT 30
    `);
    let cityTable = '## Top 30 villes\n| Ville | Total | Formel | Informel |\n|-------|-------|--------|----------|\n';
    for (const row of byCity) {
        cityTable += `| ${row.zone} | ${row.nb} | ${row.formel} | ${row.informel} |\n`;
    }
    sections.push(cityTable);

    // ── 4. If the user mentions a specific city, give detailed breakdown ──
    const lowerMsg = userMessage.toLowerCase();
    // Try to find a matching city
    const [allCities]: any = await pool.query(`SELECT DISTINCT zone FROM points_de_vente WHERE zone IS NOT NULL AND zone != '' AND zone != 'Autre'`);
    let matchedCity: string | null = null;
    for (const row of allCities) {
        if (lowerMsg.includes(row.zone.toLowerCase())) {
            matchedCity = row.zone;
            break;
        }
    }

    if (matchedCity) {
        const [cityDetail]: any = await pool.query(`
            SELECT categorie, COUNT(*) as nb,
                   SUM(CASE WHEN type='Formel' THEN 1 ELSE 0 END) as formel,
                   SUM(CASE WHEN type='Informel' THEN 1 ELSE 0 END) as informel
            FROM points_de_vente 
            WHERE zone = ?
            GROUP BY categorie 
            ORDER BY nb DESC
        `, [matchedCity]);

        let detailTable = `## Détail pour la ville "${matchedCity}"\n| Catégorie | Total | Formel | Informel |\n|-----------|-------|--------|----------|\n`;
        let cityTotal = 0;
        for (const row of cityDetail) {
            detailTable += `| ${row.categorie} | ${row.nb} | ${row.formel} | ${row.informel} |\n`;
            cityTotal += Number(row.nb);
        }
        detailTable += `\n**Total ${matchedCity} : ${cityTotal} points de vente**`;
        sections.push(detailTable);
    }

    // ── 5. If user mentions a specific category, give city breakdown for that category ──
    const [allCategories]: any = await pool.query(`SELECT DISTINCT categorie FROM points_de_vente WHERE categorie IS NOT NULL`);
    let matchedCategory: string | null = null;
    for (const row of allCategories) {
        if (lowerMsg.includes(row.categorie.toLowerCase())) {
            matchedCategory = row.categorie;
            break;
        }
    }

    if (matchedCategory) {
        const [catDetail]: any = await pool.query(`
            SELECT zone, COUNT(*) as nb
            FROM points_de_vente 
            WHERE categorie = ? AND zone IS NOT NULL AND zone != '' AND zone != 'Autre'
            GROUP BY zone 
            ORDER BY nb DESC 
            LIMIT 15
        `, [matchedCategory]);

        let catCityTable = `## Top villes pour la catégorie "${matchedCategory}"\n| Ville | Nombre |\n|-------|--------|\n`;
        for (const row of catDetail) {
            catCityTable += `| ${row.zone} | ${row.nb} |\n`;
        }

        const [catTotal]: any = await pool.query(`SELECT COUNT(*) as nb FROM points_de_vente WHERE categorie = ?`, [matchedCategory]);
        catCityTable += `\n**Total "${matchedCategory}" : ${catTotal[0].nb} points de vente**`;
        sections.push(catCityTable);
    }

    // ── 6. Recent data collection activity ──
    const [recentActivity]: any = await pool.query(`
        SELECT source, COUNT(*) as nb 
        FROM points_de_vente 
        GROUP BY source
    `);
    let sourceInfo = '## Sources de données\n';
    for (const row of recentActivity) {
        sourceInfo += `- ${row.source} : ${row.nb} points\n`;
    }
    sections.push(sourceInfo);

    return sections.join('\n\n');
}

export const chatWithAI = async (req: Request, res: Response) => {
    const { message, history } = req.body;
    const client = getMistralClient();

    if (!message) {
        return res.status(400).json({ message: 'Message requis' });
    }

    try {
        if (!client) {
            return res.json({
                content: "Je fonctionne actuellement en mode local. Pour une conversation plus fluide et humaine, veuillez configurer une clé API Mistral.",
                isLocal: true
            });
        }

        // Build a rich data context based on the user's question
        const dataContext = await buildDataContext(message);

        const systemPrompt = `Tu es l'assistant intelligent de GeoCommercial, un consultant expert en géo-marketing spécialisé dans le marché marocain.

Ton objectif est d'aider les utilisateurs à tirer le meilleur parti de leurs données avec une approche humaine, fluide et directe. Tu ne te contentes pas de donner des chiffres, tu les analyses pour apporter de la valeur.

## Ton identité et ton ton :
1. **Naturel et Fluide** : Évite les phrases robotiques. Parle comme un collaborateur expert qui discute autour d'un café. Utilise des transitions fluides entre tes idées.
2. **Professionnel mais Accessible** : Ton ton est sérieux (on parle de business et de données) mais chaleureux.
3. **Réactif** : Montre que tu as compris la question en introduisant brièvement tes réponses.

## Tes données (Accès privilégié) :
Voici les statistiques extraites en temps réel de notre base de données pour t'aider :
${dataContext}

## Tes règles d'or :
- **Réponse directe** : Utilise les chiffres ci-dessus immédiatement. Ne dis JAMAIS "vérifiez dans la base" – les données, c'est TOI qui les as.
- **Mise en forme** : Utilise le gras pour les chiffres clés et des listes à puces pour que tes insights sautent aux yeux.
- **Analyse proactive** : Ne donne pas juste un chiffre, explique ce qu'il signifie (ex: "C'est une concentration intéressante sur Casablanca qui représente X% du total").
- **Gérez l'inconnu** : Si une information précise manque, n'hésite pas à faire une estimation basée sur tes connaissances générales du commerce au Maroc tout en précisant que c'est une analyse contextuelle.
- **Engagement** : Termine souvent par une question ouverte ou une suggestion pour approfondir l'analyse (ex: "Souhaitez-vous que je compare ces chiffres avec une autre ville ?").`;

        // Set up streaming headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const chatStream = await client.chat.stream({
            model: "mistral-large-latest",
            messages: [
                { role: "system", content: systemPrompt },
                ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
                { role: "user", content: message }
            ],
        });

        for await (const chunk of chatStream) {
            const content = chunk.data.choices[0]?.delta?.content || "";
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error: any) {
        console.error('Erreur Chat AI:', error);
        // If headers are already sent, we can't send a JSON error
        if (!res.headersSent) {
            res.status(500).json({ message: "Erreur lors de la communication avec l'IA" });
        } else {
            res.write(`data: ${JSON.stringify({ error: "Erreur de flux" })}\n\n`);
            res.end();
        }
    }
};
