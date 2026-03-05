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

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}