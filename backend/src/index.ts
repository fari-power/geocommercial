import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pointOfSaleRoutes from './routes/pointOfSale.routes.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/points', pointOfSaleRoutes);
app.use('/api/chat', chatRoutes);

// OpenAPI JSON spec (for mobile apps or code generators)
app.get('/api-spec.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Swagger Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { font-size: 2.5em; }
    `,
    customSiteTitle: 'GeoCommercial API — Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
    },
}));

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(port, () => {
    console.log(`🚀 Serveur GeoCommercial démarré sur http://localhost:${port}`);
    console.log(`📚 Swagger UI disponible sur http://localhost:${port}/api-docs`);
    console.log(`📄 OpenAPI JSON spec sur http://localhost:${port}/api-spec.json`);
});
