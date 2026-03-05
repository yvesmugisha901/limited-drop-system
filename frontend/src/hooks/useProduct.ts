import { useState, useEffect, useCallback } from 'react';
import { getProduct } from '../api';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currentStock: number;
    totalStock: number;
    imageUrl?: string;
    createdAt: string;
}

export const useProduct = (productId: string) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProduct = useCallback(async () => {
        try {
            const res = await getProduct(productId);
            setProduct(res.data);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch product');
            }
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();

        // Refresh stock every 5 seconds
        const interval = setInterval(fetchProduct, 5000);
        return () => clearInterval(interval);
    }, [fetchProduct]);

    return { product, loading, error, refetch: fetchProduct };
};