import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Simple hash (use bcrypt in production)
const hashPassword = (password: string): string =>
    crypto.createHash('sha256').update(password + process.env.JWT_SECRET).digest('hex');

const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response, next) => {
    try {
        const body = registerSchema.parse(req.body);

        const existing = await prisma.user.findUnique({ where: { email: body.email } });
        if (existing) throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');

        const user = await prisma.user.create({
            data: {
                email: body.email,
                name: body.name,
                passwordHash: hashPassword(body.password),
            },
            select: { id: true, email: true, name: true },
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
        next(err);
    }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next) => {
    try {
        const body = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: body.email } });
        if (!user || user.passwordHash !== hashPassword(body.password)) {
            throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name }, token } });
    } catch (err) {
        next(err);
    }
});

export default router;