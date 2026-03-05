import { useState } from 'react';
import { reserveProduct, checkout } from '../api';

export interface Reservation {
    reservationId: string;
    productId: string;
    quantity: number;
    expiresAt: string;
    status: string;
}

export interface Order {
    orderId: string;
    reservationId: string;
    totalAmount: number;
    status: string;
    product: {
        name: string;
        price: number;
    };
}

export const useReservation = () => {
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const isAxiosError = (err: unknown): err is { response?: { data?: { error?: string } } } => {
        return typeof err === 'object' && err !== null && 'response' in err;
    };

    const reserve = async (productId: string, quantity: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await reserveProduct(productId, quantity);
            setReservation(res.data);

            const expiresAt = new Date(res.data.expiresAt).getTime();
            const interval = setInterval(() => {
                const remaining = Math.floor((expiresAt - Date.now()) / 1000);
                if (remaining <= 0) {
                    clearInterval(interval);
                    setTimeLeft(0);
                    setReservation(null);
                    setError('Your reservation has expired!');
                } else {
                    setTimeLeft(remaining);
                }
            }, 1000);

            return res.data;
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                setError(err.response?.data?.error || 'Failed to reserve product');
            } else {
                setError('Failed to reserve product');
            }
        } finally {
            setLoading(false);
        }
    };

    const completeCheckout = async (reservationId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await checkout(reservationId);
            setOrder(res.data);
            setReservation(null);
            setTimeLeft(null);
            return res.data;
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                setError(err.response?.data?.error || 'Checkout failed');
            } else {
                setError('Checkout failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return {
        reservation,
        order,
        loading,
        error,
        timeLeft,
        formatTime,
        reserve,
        completeCheckout,
    };
};