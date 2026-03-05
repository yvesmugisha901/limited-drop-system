import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new AppError(401, 'Authentication token required', 'UNAUTHORIZED'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch {
        next(new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN'));
    }
};