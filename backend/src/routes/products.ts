import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const listSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(['name', 'price', 'currentStock', 'createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    inStock: z.enum(['true', 'false']).optional(),
});

// GET /products
router.get('/', async (req: Request, res: Response, next) => {
    try {
        const query = listSchema.parse(req.query);
        const skip = (query.page - 1) * query.limit;

        const where: Record<string, unknown> = { isActive: true };

        if (query.search) {
            where['name'] = { contains: query.search, mode: 'insensitive' };
        }
        if (query.inStock === 'true') {
            where['currentStock'] = { gt: 0 };
        } else if (query.inStock === 'false') {
            where['currentStock'] = 0;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: { [query.sortBy]: query.order },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    currentStock: true,
                    totalStock: true,
                    imageUrl: true,
                    createdAt: true,
                },
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /products/:id
router.get('/:id', async (req: Request, res: Response, next) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params['id'] },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                currentStock: true,
                totalStock: true,
                imageUrl: true,
                createdAt: true,
            },
        });

        if (!product) throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');

        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
});

export default router;