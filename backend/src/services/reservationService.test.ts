import { reservationService } from '../services/reservationService';
import prisma from '../utils/prisma';

// Mock Prisma
jest.mock('../utils/prisma', () => ({
    $transaction: jest.fn(),
    $connect: jest.fn(),
    reservation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
    },
    product: {
        update: jest.fn(),
    },
    inventoryLog: {
        create: jest.fn(),
    },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Reservation Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('reserve()', () => {
        it('should create a reservation when stock is available', async () => {
            const mockProduct = [{ id: 'prod1', name: 'Test Product', currentStock: 10, price: 100, isActive: true }];
            const mockReservation = {
                id: 'res1',
                userId: 'user1',
                productId: 'prod1',
                quantity: 1,
                expiresAt: new Date(Date.now() + 5 * 60000),
                status: 'PENDING',
                product: { name: 'Test Product', price: 100 },
            };

            (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn: Function) => {
                const tx = {
                    $queryRaw: jest.fn().mockResolvedValue(mockProduct),
                    reservation: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockResolvedValue(mockReservation),
                    },
                    product: { update: jest.fn() },
                    inventoryLog: { create: jest.fn() },
                };
                return fn(tx);
            });

            const result = await reservationService.reserve('user1', 'prod1', 1);

            expect(result.id).toBe('res1');
            expect(result.status).toBe('PENDING');
        });

        it('should throw INSUFFICIENT_STOCK when stock is 0', async () => {
            const mockProduct = [{ id: 'prod1', name: 'Test', currentStock: 0, price: 100, isActive: true }];

            (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn: Function) => {
                const tx = {
                    $queryRaw: jest.fn().mockResolvedValue(mockProduct),
                    reservation: { findFirst: jest.fn() },
                    product: { update: jest.fn() },
                    inventoryLog: { create: jest.fn() },
                };
                return fn(tx);
            });

            await expect(reservationService.reserve('user1', 'prod1', 1)).rejects.toThrow('Insufficient stock available');
        });

        it('should throw DUPLICATE_RESERVATION for existing active reservation', async () => {
            const mockProduct = [{ id: 'prod1', name: 'Test', currentStock: 10, price: 100, isActive: true }];
            const existingReservation = { id: 'res0', status: 'PENDING' };

            (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn: Function) => {
                const tx = {
                    $queryRaw: jest.fn().mockResolvedValue(mockProduct),
                    reservation: { findFirst: jest.fn().mockResolvedValue(existingReservation), create: jest.fn() },
                    product: { update: jest.fn() },
                    inventoryLog: { create: jest.fn() },
                };
                return fn(tx);
            });

            await expect(reservationService.reserve('user1', 'prod1', 1)).rejects.toThrow(
                'You already have an active reservation'
            );
        });
    });

    describe('expireReservations()', () => {
        it('should return 0 when no expired reservations', async () => {
            (mockPrisma.reservation.findMany as jest.Mock).mockResolvedValue([]);
            const result = await reservationService.expireReservations();
            expect(result.count).toBe(0);
        });

        it('should expire reservations and restore stock', async () => {
            const expired = [{ id: 'res1', productId: 'prod1', quantity: 2 }];
            (mockPrisma.reservation.findMany as jest.Mock).mockResolvedValue(expired);
            (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn: Function) => {
                const tx = {
                    reservation: { update: jest.fn() },
                    product: { update: jest.fn() },
                    inventoryLog: { create: jest.fn() },
                };
                return fn(tx);
            });

            const result = await reservationService.expireReservations();
            expect(result.count).toBe(1);
        });
    });

    describe('Concurrency simulation', () => {
        it('should handle multiple simultaneous reservation attempts', async () => {
            let callCount = 0;

            (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn: Function) => {
                callCount++;
                const stock = callCount === 1 ? 1 : 0;
                const tx = {
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'prod1', name: 'Test', currentStock: stock, price: 100, isActive: true }]),
                    reservation: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockResolvedValue({ id: `res${callCount}`, status: 'PENDING', product: {} }),
                    },
                    product: { update: jest.fn() },
                    inventoryLog: { create: jest.fn() },
                };
                return fn(tx);
            });

            const attempts = Array.from({ length: 5 }, (_, i) =>
                reservationService.reserve(`user${i}`, 'prod1', 1).catch((e) => e)
            );

            const results = await Promise.all(attempts);
            const successes = results.filter((r) => !(r instanceof Error));
            const failures = results.filter((r) => r instanceof Error);

            expect(successes.length).toBe(1);
            expect(failures.length).toBe(4);
        });
    });
});