import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { startCronJobs } from './jobs/expireReservations';
import prisma from './utils/prisma';
import logger from './utils/logger';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import reservationRoutes from './routes/reservations';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later.' },
});

// Stricter limit for reserve endpoint
const reserveLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { success: false, error: 'Too many reservation attempts.' },
});

app.use(limiter);

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/metrics', async (_req, res) => {
    const [totalProducts, totalReservations, totalOrders, activeReservations] = await Promise.all([
        prisma.product.count(),
        prisma.reservation.count(),
        prisma.order.count(),
        prisma.reservation.count({ where: { status: 'PENDING', expiresAt: { gt: new Date() } } }),
    ]);

    res.json({
        success: true,
        data: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            totalProducts,
            totalReservations,
            totalOrders,
            activeReservations,
            timestamp: new Date().toISOString(),
        },
    });
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/', reserveLimiter, reservationRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Central error handler (must be last)
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────

const start = async (): Promise<void> => {
    try {
        await prisma.$connect();
        logger.info('Database connected');

        startCronJobs();

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV });
        });
    } catch (err) {
        logger.error('Failed to start server', { error: err });
        process.exit(1);
    }
};

start();

export default app;