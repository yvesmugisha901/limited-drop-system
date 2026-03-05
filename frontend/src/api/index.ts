import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const register = async (email: string, name: string, password: string) => {
    const res = await api.post('/auth/register', { email, name, password });
    return res.data;
};

export const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
};

// Products
export const getProducts = async (page = 1, limit = 10) => {
    const res = await api.get('/products', { params: { page, limit } });
    return res.data;
};

export const getProduct = async (id: string) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
};

// Reservations
export const reserveProduct = async (productId: string, quantity: number) => {
    const res = await api.post('/reserve', { productId, quantity });
    return res.data;
};

export const checkout = async (reservationId: string) => {
    const res = await api.post('/checkout', { reservationId });
    return res.data;
};

export default api;