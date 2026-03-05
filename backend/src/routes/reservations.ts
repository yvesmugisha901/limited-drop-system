import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { reservationService } from '../services/reservationService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const reserveSchema = z.object({
    productId: z.string().min(1, 'productId is required'),
    quantity: z.number().int().positive('quantity must be a positive integer'),
});

const checkoutSchema = z.object({
    reservationId: z.string().min(1, 'reservationId is required'),
});

// POST /reserve
router.post('/reserve', authenticate, async (req: AuthRequest, res: Response, next) => {
    try {
        const body = reserveSchema.parse(req.body);

        if (!req.userId) throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');

        const reservation = await reservationService.reserve(req.userId, body.productId, body.quantity);

        res.status(201).json({
            success: true,
            data: {
                reservationId: reservation.id,
                productId: reservation.productId,
                quantity: reservation.quantity,
                expiresAt: reservation.expiresAt,
                status: reservation.status,
            },
        });
    } catch (err) {
        next(err);
    }
});

// POST /checkout
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response, next) => {
    try {
        const body = checkoutSchema.parse(req.body);

        if (!req.userId) throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');

        const order = await reservationService.checkout(req.userId, body.reservationId);

        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                reservationId: order.reservationId,
                totalAmount: order.totalAmount,
                status: order.status,
                product: order.product,
            },
        });
    } catch (err) {
        next(err);
    }
});

export default router;