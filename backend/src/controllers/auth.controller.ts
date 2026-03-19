import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendSms } from '../utils/sms.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'geocommercial_secret_key_2026';

/**
 * Demander un code OTP par SMS
 */
export const requestOTP = async (req: Request, res: Response) => {
    const { phone_number } = req.body;

    if (!phone_number) {
        return res.status(400).json({ message: 'Numéro de téléphone requis' });
    }

    // Normaliser le numéro (assurer le format +212XXXXXXXXX)
    let formattedPhone = phone_number.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '+212' + formattedPhone.substring(1);
    }

    try {
        // Code OTP fixe (défini dans .env via OTP_CODE)
        const otpCode = process.env.OTP_CODE || '123456';

        // Enregistrer l'OTP en base (supprimer les anciens d'abord)
        await pool.query('DELETE FROM otp_requests WHERE phone_number = ?', [formattedPhone]);
        await pool.query('INSERT INTO otp_requests (phone_number, code) VALUES (?, ?)', [formattedPhone, otpCode]);

        // Envoyer le SMS
        await sendSms(formattedPhone, `Votre code de confirmation GeoCommercial est : ${otpCode}`);

        res.json({ message: 'Code OTP envoyé par SMS', phone: formattedPhone });
    } catch (error) {
        console.error('Erreur demande OTP:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du SMS' });
    }
};

/**
 * Vérifier le code OTP et connecter / inscrire l'utilisateur
 */
export const verifyOTP = async (req: Request, res: Response) => {
    const { phone_number, code } = req.body;

    if (!phone_number || !code) {
        return res.status(400).json({ message: 'Numéro et code requis' });
    }

    // Normaliser le numéro (assurer le format +212XXXXXXXXX) pour correspondre à requestOTP
    let formattedPhone = phone_number.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '+212' + formattedPhone.substring(1);
    }

    try {
        // Vérifier l'OTP avec le numéro formaté
        const [otp]: any = await pool.query(
            'SELECT * FROM otp_requests WHERE phone_number = ? AND code = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)',
            [formattedPhone, code]
        );

        if (otp.length === 0) {
            return res.status(401).json({ message: 'Code incorrect ou expiré' });
        }

        // Supprimer l'OTP utilisé
        await pool.query('DELETE FROM otp_requests WHERE phone_number = ?', [formattedPhone]);

        // Chercher ou créer l'utilisateur avec le numéro formaté
        let [users]: any = await pool.query('SELECT * FROM users WHERE phone_number = ?', [formattedPhone]);
        let user;

        if (users.length === 0) {
            // Créer un nouvel utilisateur agent (pour la collecte mobile)
            const [result]: any = await pool.query(
                'INSERT INTO users (phone_number, role, points_sent, nb_validated, nb_rejected) VALUES (?, ?, 0, 0, 0)',
                [formattedPhone, 'agent']
            );
            const [newUser]: any = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUser[0];
        } else {
            user = users[0];
        }

        // Créer le Token JWT
        const token = jwt.sign(
            { id: user.id, phone: user.phone_number, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' } // Session longue pour mobile
        );

        // Récupérer aussi ses bons d'achat
        const [vouchers]: any = await pool.query('SELECT * FROM vouchers WHERE user_id = ?', [user.id]);

        res.json({
            token,
            user: {
                id: user.id,
                phone: user.phone_number,
                role: user.role,
                points_sent: user.points_sent,
                nb_validated: user.nb_validated,
                nb_rejected: user.nb_rejected,
                vouchers
            }
        });
    } catch (error) {
        console.error('Erreur vérification OTP:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const register = async (req: Request, res: Response) => {
    // ... existante (pour admin par exemple)
    const { email, password } = req.body;

    try {
        const [existingUser]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result]: any = await pool.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'admin']
        );

        res.status(201).json({ message: 'Utilisateur créé avec succès', userId: result.insertId });
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                points_sent: user.points_sent,
                nb_validated: user.nb_validated,
                nb_rejected: user.nb_rejected
            }
        });
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const getMe = async (req: any, res: Response) => {
    try {
        const [users]: any = await pool.query(
            'SELECT id, email, phone_number as phone, role, points_sent, nb_validated, nb_rejected FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        // Récupérer aussi ses bons d'achat
        const [vouchers]: any = await pool.query('SELECT * FROM vouchers WHERE user_id = ?', [req.user.id]);

        res.json({
            ...users[0],
            vouchers
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const getRanking = async (req: Request, res: Response) => {
    try {
        const [users]: any = await pool.query(
            'SELECT id, phone_number, email, role, points_sent, nb_validated, nb_rejected FROM users WHERE role = "agent" ORDER BY points_sent DESC'
        );
        
        // Ajouter la liste et le nombre de bons d'achat (vouchers) pour chaque agent
        for (let user of users) {
            const [vouchers]: any = await pool.query('SELECT partner, code, value, created_at FROM vouchers WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
            user.vouchers = vouchers;
            user.vouchersCount = vouchers.length;
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du classement' });
    }
};

export const getMyVouchers = async (req: any, res: Response) => {
    try {
        const [vouchers]: any = await pool.query('SELECT * FROM vouchers WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des bons' });
    }
};

/**
 * Échanger des points contre un bon d'achat
 */
export const exchangeVoucher = async (req: any, res: Response) => {
    const { cost, partner } = req.body;
    const userId = req.user.id;

    if (!cost || !partner) {
        return res.status(400).json({ message: 'Le coût et le partenaire sont requis' });
    }

    try {
        // 1. Vérifier si l'utilisateur a assez de points
        const [users]: any = await pool.query('SELECT points_sent FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        const currentPoints = users[0].points_sent || 0;
        if (currentPoints < cost) {
            return res.status(400).json({ message: 'Solde de points insuffisant' });
        }

        // 2. Générer un code unique GC-XXXXXX
        const code = 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // 3. Déduire les points et ajouter le bon (Transaction-like)
        await pool.query('UPDATE users SET points_sent = points_sent - ? WHERE id = ?', [cost, userId]);
        await pool.query(
            'INSERT INTO vouchers (user_id, partner, code, value) VALUES (?, ?, ?, ?)',
            [userId, partner, code, cost] // On utilise 'cost' comme valeur indicative
        );

        res.json({
            message: 'Echange réussi !',
            voucher: {
                partner,
                code,
                value: cost
            },
            remainingPoints: currentPoints - cost
        });

    } catch (error) {
        console.error('Erreur échange:', error);
        res.status(500).json({ message: 'Erreur lors de l\'échange de points' });
    }
};

