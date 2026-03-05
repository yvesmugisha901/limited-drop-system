import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const RESERVATION_EXPIRY_MINUTES = parseInt(process.env.RESERVATION_EXPIRY_MINUTES || '5');

export const reservationService = {
    /**
     * Reserve a product - uses a database transaction with SELECT FOR UPDATE
     * to prevent race conditions and overselling.
     */
    async reserve(userId: string, productId: string, quantity: number) {
        return await prisma.$transaction(async (tx) => {
            // Lock the product row to prevent concurrent modifications
            const product = await tx.$queryRaw<Array<{
                id: string;
                name: string;
                currentStock: number;
                price: number;
                isActive: boolean;
            }>>`
        SELECT id, name, "currentStock", price, "isActive"
        FROM "Product"
        WHERE id = ${productId}
        FOR UPDATE
      `;

            if (!product[0]) {
                throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
            }

            const p = product[0];

            if (!p.isActive) {
                throw new AppError(400, 'Product is not available', 'PRODUCT_INACTIVE');
            }

            if (p.currentStock < quantity) {
                throw new AppError(409, 'Insufficient stock available', 'INSUFFICIENT_STOCK');
            }

            // Check for existing active reservation by this user for this product
            const existingReservation = await tx.reservation.findFirst({
                where: {
                    userId,
                    productId,
                    status: 'PENDING',
                    expiresAt: { gt: new Date() },
                },
            });

            if (existingReservation) {
                throw new AppError(409, 'You already have an active reservation for this product', 'DUPLICATE_RESERVATION');
            }

            const expiresAt = new Date(Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000);

            // Deduct stock
            await tx.product.update({
                where: { id: productId },
                data: { currentStock: { decrement: quantity } },
            });

            // Create reservation
            const reservation = await tx.reservation.create({
                data: { userId, productId, quantity, expiresAt, status: 'PENDING' },
                include: { product: { select: { name: true, price: true } } },
            });

            // Audit log
            await tx.inventoryLog.create({
                data: {
                    productId,
                    action: 'DEDUCTED',
                    quantity,
                    reason: `Reserved by user ${userId} - reservation ${reservation.id}`,
                },
            });

            logger.info('Reservation created', { reservationId: reservation.id, userId, productId, quantity });

            return reservation;
        });
    },

    /**
     * Complete checkout - converts reservation to order
     */
    async checkout(userId: string, reservationId: string) {
        return await prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.findFirst({
                where: { id: reservationId, userId },
                include: { product: true },
            });

            if (!reservation) {
                throw new AppError(404, 'Reservation not found', 'RESERVATION_NOT_FOUND');
            }

            if (reservation.status === 'COMPLETED') {
                throw new AppError(409, 'Reservation already completed', 'ALREADY_COMPLETED');
            }

            if (reservation.status === 'EXPIRED' || reservation.status === 'CANCELLED') {
                throw new AppError(410, 'Reservation has expired or been cancelled', 'RESERVATION_EXPIRED');
            }

            if (new Date() > reservation.expiresAt) {
                await tx.reservation.update({ where: { id: reservationId }, data: { status: 'EXPIRED' } });
                await tx.product.update({
                    where: { id: reservation.productId },
                    data: { currentStock: { increment: reservation.quantity } },
                });
                throw new AppError(410, 'Reservation has expired', 'RESERVATION_EXPIRED');
            }

            const totalAmount = reservation.product.price * reservation.quantity;

            // Create order
            const order = await tx.order.create({
                data: {
                    userId,
                    productId: reservation.productId,
                    reservationId,
                    quantity: reservation.quantity,
                    totalAmount,
                    status: 'CONFIRMED',
                },
                include: { product: { select: { name: true, price: true } } },
            });

            // Mark reservation completed
            await tx.reservation.update({ where: { id: reservationId }, data: { status: 'COMPLETED' } });

            logger.info('Checkout completed', { orderId: order.id, reservationId, userId });

            return order;
        });
    },

    /**
     * Expire all pending reservations that have passed their expiry time
     * Called by cron job
     */
    async expireReservations() {
        const now = new Date();

        const expired = await prisma.reservation.findMany({
            where: { status: 'PENDING', expiresAt: { lte: now } },
            select: { id: true, productId: true, quantity: true },
        });

        if (expired.length === 0) return { count: 0 };

        await prisma.$transaction(async (tx) => {
            for (const res of expired) {
                await tx.reservation.update({ where: { id: res.id }, data: { status: 'EXPIRED' } });
                await tx.product.update({
                    where: { id: res.productId },
                    data: { currentStock: { increment: res.quantity } },
                });
                await tx.inventoryLog.create({
                    data: {
                        productId: res.productId,
                        action: 'RESTORED',
                        quantity: res.quantity,
                        reason: `Reservation ${res.id} expired`,
                    },
                });
            }
        });

        logger.info(`Expired ${expired.length} reservations and restored stock`);
        return { count: expired.length };
    },
};