import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-API-KEY');
    const validKey = process.env.API_ACCESS_KEY || 'geocommercial_default_key_2026';

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({
            message: 'Accès API refusé. Clé X-API-KEY manquante ou invalide.'
        });
    }

    next();
};
