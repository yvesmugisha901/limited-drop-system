import { useState } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useReservation } from '../hooks/useReservation';

interface DropPageProps {
    productId: string;
    onLogout: () => void;
    onBack: () => void;
}

const DropPage = ({ productId, onLogout, onBack }: DropPageProps) => {
    const { product, loading: productLoading, error: productError } = useProduct(productId);
    const { reservation, order, loading, error, timeLeft, formatTime, reserve, completeCheckout } = useReservation();
    const [quantity] = useState(1);

    const handleReserve = async () => {
        if (!product) return;
        await reserve(product.id, quantity);
    };

    const handleCheckout = async () => {
        if (!reservation) return;
        await completeCheckout(reservation.reservationId);
    };

    if (productLoading) return <div style={styles.center}>Loading product...</div>;
    if (productError) return <div style={styles.center}>Error: {productError}</div>;
    if (!product) return <div style={styles.center}>Product not found</div>;

    const isSoldOut = product.currentStock === 0;
    const stockPercent = (product.currentStock / product.totalStock) * 100;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={onBack}>← Back</button>
                <h1 style={styles.headerTitle}>🛍️ Limited Drop</h1>
                <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
            </div>

            {/* Product Card */}
            <div style={styles.card}>
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={styles.image} />
                ) : (
                    <div style={styles.imagePlaceholder}>🛍️</div>
                )}

                <div style={styles.body}>
                    <h2 style={styles.productName}>{product.name}</h2>
                    <p style={styles.description}>{product.description}</p>
                    <p style={styles.price}>${product.price.toFixed(2)}</p>

                    {/* Stock Bar */}
                    <div style={styles.stockSection}>
                        <div style={styles.stockLabel}>
                            <span>Stock remaining</span>
                            <span style={{ color: isSoldOut ? '#e00' : '#333' }}>
                                {product.currentStock} / {product.totalStock}
                            </span>
                        </div>
                        <div style={styles.stockBarBg}>
                            <div
                                style={{
                                    ...styles.stockBarFill,
                                    width: `${stockPercent}%`,
                                    background: stockPercent > 50 ? '#4caf50' : stockPercent > 20 ? '#ff9800' : '#f44336',
                                }}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && <div style={styles.error}>{error}</div>}

                    {/* Order Success */}
                    {order && (
                        <div style={styles.success}>
                            ✅ Order confirmed! Order ID: {order.orderId}<br />
                            Total: ${order.totalAmount.toFixed(2)}
                        </div>
                    )}

                    {/* Countdown Timer */}
                    {reservation && timeLeft !== null && timeLeft > 0 && (
                        <div style={styles.timerBox}>
                            <p style={styles.timerLabel}>⏱ Reservation expires in</p>
                            <p style={styles.timerCount}>{formatTime(timeLeft)}</p>
                            <button
                                style={styles.checkoutBtn}
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : '✅ Complete Checkout'}
                            </button>
                        </div>
                    )}

                    {/* Expired */}
                    {timeLeft === 0 && (
                        <div style={styles.error}>
                            ⏰ Your reservation has expired! Please try again.
                        </div>
                    )}

                    {/* Reserve Button */}
                    {!reservation && !order && (
                        <button
                            style={{
                                ...styles.reserveBtn,
                                background: isSoldOut
                                    ? '#ccc'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                cursor: isSoldOut ? 'not-allowed' : 'pointer',
                            }}
                            onClick={handleReserve}
                            disabled={isSoldOut || loading}
                        >
                            {loading ? '⏳ Reserving...' : isSoldOut ? '❌ Sold Out' : '🛒 Reserve Now'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: '20px',
    },
    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '600px',
        margin: '0 auto 24px',
    },
    headerTitle: { fontSize: '24px', margin: 0 },
    backBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        background: '#667eea',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '14px',
    },
    logoutBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        background: '#eee',
        cursor: 'pointer',
        fontSize: '14px',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto',
        overflow: 'hidden',
    },
    image: { width: '100%', height: '300px', objectFit: 'cover' },
    imagePlaceholder: {
        width: '100%',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '80px',
        background: '#f0f0f0',
    },
    body: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    productName: { fontSize: '28px', margin: 0 },
    description: { color: '#666', margin: 0 },
    price: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 },
    stockSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
    stockLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
    },
    stockBarBg: {
        height: '8px',
        background: '#eee',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    stockBarFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.3s ease',
    },
    error: {
        background: '#ffe0e0',
        color: '#c00',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
    },
    success: {
        background: '#e0ffe0',
        color: '#060',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
    },
    timerBox: {
        background: '#fff8e1',
        border: '1px solid #ffc107',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
    },
    timerLabel: { margin: '0 0 8px', fontSize: '14px', color: '#555' },
    timerCount: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#e65100',
        margin: '0 0 12px',
    },
    reserveBtn: {
        padding: '16px',
        borderRadius: '10px',
        border: 'none',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    checkoutBtn: {
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        background: '#4caf50',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};

export default DropPage;