import cron from 'node-cron';
import { reservationService } from '../services/reservationService';
import logger from '../utils/logger';

export const startCronJobs = (): void => {
    // Run every minute to check for expired reservations
    cron.schedule('* * * * *', async () => {
        try {
            const result = await reservationService.expireReservations();
            if (result.count > 0) {
                logger.info('Cron: expired reservations', { count: result.count });
            }
        } catch (err) {
            logger.error('Cron job failed', { error: err });
        }
    });

    logger.info('Cron jobs started');
};