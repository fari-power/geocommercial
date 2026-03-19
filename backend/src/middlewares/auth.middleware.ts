import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'geocommercial_secret_key_2026';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalide.' });
    }
};
