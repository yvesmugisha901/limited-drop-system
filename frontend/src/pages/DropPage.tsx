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

    if (productLoading) return (
        <div style={styles.fullCenter}>
            <p style={styles.loadingText}>Loading drop...</p>
        </div>
    );

    if (productError) return (
        <div style={styles.fullCenter}>
            <p style={{ color: '#c53030' }}>Error: {productError}</p>
        </div>
    );

    if (!product) return (
        <div style={styles.fullCenter}>
            <p style={{ color: '#c53030' }}>Product not found</p>
        </div>
    );

    const isSoldOut = product.currentStock === 0;
    const stockPercent = (product.currentStock / product.totalStock) * 100;
    const isLow = stockPercent <= 20 && !isSoldOut;

    return (
        <div style={styles.page}>
            {/* Navbar */}
            <nav style={styles.nav}>
                <div style={styles.navInner}>
                    <div style={styles.navLeft}>
                        <button style={styles.backBtn} onClick={onBack}>← Back to Drops</button>
                    </div>
                    <div style={styles.navBrand}>
                        <span style={styles.navLogo}>⚡</span>
                        <span style={styles.navTitle}>LimitedDrop</span>
                    </div>
                    <div style={styles.navRight}>
                        <button style={styles.logoutBtn} onClick={onLogout}>Sign Out</button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div style={styles.main}>
                <div style={styles.layout}>

                    {/* Left - Image */}
                    <div style={styles.imageSection}>
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} style={styles.image} />
                        ) : (
                            <div style={styles.imagePlaceholder}>
                                <span style={styles.placeholderIcon}>⚡</span>
                            </div>
                        )}

                        {/* Status Badge */}
                        <div style={isSoldOut ? styles.badgeSoldOut : isLow ? styles.badgeLow : styles.badgeAvailable}>
                            {isSoldOut ? 'SOLD OUT' : isLow ? '⚠ ALMOST GONE' : '● AVAILABLE NOW'}
                        </div>
                    </div>

                    {/* Right - Details */}
                    <div style={styles.detailsSection}>
                        <p style={styles.eyebrow}>LIMITED DROP</p>
                        <h1 style={styles.productName}>{product.name}</h1>
                        <p style={styles.price}>${product.price.toFixed(2)}</p>
                        <p style={styles.description}>{product.description}</p>

                        {/* Divider */}
                        <div style={styles.divider} />

                        {/* Stock */}
                        <div style={styles.stockSection}>
                            <div style={styles.stockLabel}>
                                <span style={styles.stockText}>STOCK REMAINING</span>
                                <span style={{
                                    ...styles.stockCount,
                                    color: isSoldOut ? '#c53030' : isLow ? '#dd6b20' : '#276749',
                                }}>
                                    {product.currentStock} / {product.totalStock} units
                                </span>
                            </div>
                            <div style={styles.stockBarBg}>
                                <div style={{
                                    ...styles.stockBarFill,
                                    width: `${stockPercent}%`,
                                    background: isSoldOut ? '#e2e8f0' : isLow ? '#dd6b20' : '#1a3a6b',
                                }} />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={styles.errorBox}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Order Success */}
                        {order && (
                            <div style={styles.successBox}>
                                <p style={styles.successTitle}>✓ Order Confirmed!</p>
                                <p style={styles.successDetail}>Order ID: <strong>{order.orderId}</strong></p>
                                <p style={styles.successDetail}>Total Paid: <strong>${order.totalAmount.toFixed(2)}</strong></p>
                            </div>
                        )}

                        {/* Timer */}
                        {reservation && timeLeft !== null && timeLeft > 0 && (
                            <div style={styles.timerBox}>
                                <p style={styles.timerEyebrow}>RESERVATION EXPIRES IN</p>
                                <p style={styles.timerCount}>{formatTime(timeLeft)}</p>
                                <p style={styles.timerNote}>Complete your purchase before time runs out</p>
                                <button
                                    style={loading ? styles.checkoutBtnDisabled : styles.checkoutBtn}
                                    onClick={handleCheckout}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Complete Purchase →'}
                                </button>
                            </div>
                        )}

                        {/* Expired */}
                        {timeLeft === 0 && (
                            <div style={styles.errorBox}>
                                ⏰ Your reservation expired. Please reserve again.
                            </div>
                        )}

                        {/* Reserve Button */}
                        {!reservation && !order && (
                            <div>
                                <button
                                    style={isSoldOut || loading ? styles.reserveBtnDisabled : styles.reserveBtn}
                                    onClick={handleReserve}
                                    disabled={isSoldOut || loading}
                                >
                                    {loading ? 'Reserving...' : isSoldOut ? 'Sold Out' : 'Reserve Now →'}
                                </button>
                                {!isSoldOut && (
                                    <p style={styles.reserveNote}>
                                        Your item will be held for 5 minutes after reservation
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <p style={styles.footerText}>© 2026 LimitedDrop — All reservations held for 5 minutes</p>
            </footer>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        background: '#f7f9fc',
        fontFamily: "'Georgia', serif",
        display: 'flex',
        flexDirection: 'column',
    },
    fullCenter: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Georgia', serif",
    },
    loadingText: {
        fontSize: '18px',
        color: '#6b7a99',
    },
    nav: {
        background: '#0a1628',
        position: 'sticky' as const,
        top: 0,
        zIndex: 100,
    },
    navInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    navLeft: { flex: 1 },
    navBrand: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    navLogo: { fontSize: '24px' },
    navTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#fff',
        letterSpacing: '-0.5px',
    },
    navRight: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
    },
    backBtn: {
        padding: '8px 16px',
        borderRadius: '6px',
        border: '1px solid #a8c4e8',
        background: 'transparent',
        color: '#a8c4e8',
        fontSize: '14px',
        cursor: 'pointer',
    },
    logoutBtn: {
        padding: '8px 20px',
        borderRadius: '6px',
        border: '1px solid #a8c4e8',
        background: 'transparent',
        color: '#a8c4e8',
        fontSize: '14px',
        cursor: 'pointer',
    },
    main: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 32px',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box' as const,
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        alignItems: 'start',
    },
    imageSection: {
        position: 'relative' as const,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(10,22,40,0.15)',
    },
    image: {
        width: '100%',
        height: '480px',
        objectFit: 'cover' as const,
        display: 'block',
    },
    imagePlaceholder: {
        width: '100%',
        height: '480px',
        background: 'linear-gradient(160deg, #0a1628, #1a3a6b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIcon: { fontSize: '80px' },
    badgeAvailable: {
        position: 'absolute' as const,
        bottom: '20px',
        left: '20px',
        background: '#276749',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        padding: '6px 14px',
        borderRadius: '4px',
        fontFamily: "'Arial', sans-serif",
    },
    badgeLow: {
        position: 'absolute' as const,
        bottom: '20px',
        left: '20px',
        background: '#dd6b20',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        padding: '6px 14px',
        borderRadius: '4px',
        fontFamily: "'Arial', sans-serif",
    },
    badgeSoldOut: {
        position: 'absolute' as const,
        bottom: '20px',
        left: '20px',
        background: '#718096',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        padding: '6px 14px',
        borderRadius: '4px',
        fontFamily: "'Arial', sans-serif",
    },
    detailsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    eyebrow: {
        fontSize: '11px',
        letterSpacing: '3px',
        color: '#1a3a6b',
        margin: 0,
        fontFamily: "'Arial', sans-serif",
        fontWeight: '700',
    },
    productName: {
        fontSize: '40px',
        fontWeight: '700',
        color: '#0a1628',
        margin: 0,
        letterSpacing: '-1.5px',
        lineHeight: 1.1,
    },
    price: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1a3a6b',
        margin: 0,
    },
    description: {
        fontSize: '16px',
        color: '#6b7a99',
        margin: 0,
        lineHeight: 1.7,
    },
    divider: {
        height: '1px',
        background: '#e8edf5',
    },
    stockSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    stockLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stockText: {
        fontSize: '11px',
        letterSpacing: '2px',
        color: '#6b7a99',
        fontFamily: "'Arial', sans-serif",
        fontWeight: '700',
    },
    stockCount: {
        fontSize: '14px',
        fontWeight: '700',
        fontFamily: "'Arial', sans-serif",
    },
    stockBarBg: {
        height: '6px',
        background: '#e8edf5',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    stockBarFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.5s ease',
    },
    errorBox: {
        background: '#fff5f5',
        border: '1px solid #fed7d7',
        color: '#c53030',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
    },
    successBox: {
        background: '#f0fff4',
        border: '1px solid #9ae6b4',
        padding: '20px',
        borderRadius: '8px',
    },
    successTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#276749',
        margin: '0 0 8px',
    },
    successDetail: {
        fontSize: '14px',
        color: '#276749',
        margin: '4px 0',
    },
    timerBox: {
        background: '#0a1628',
        borderRadius: '12px',
        padding: '28px',
        textAlign: 'center' as const,
        color: '#fff',
    },
    timerEyebrow: {
        fontSize: '11px',
        letterSpacing: '2px',
        color: '#a8c4e8',
        margin: '0 0 12px',
        fontFamily: "'Arial', sans-serif",
    },
    timerCount: {
        fontSize: '56px',
        fontWeight: '700',
        color: '#fff',
        margin: '0 0 8px',
        letterSpacing: '-2px',
        fontFamily: "'Arial', sans-serif",
    },
    timerNote: {
        fontSize: '13px',
        color: '#a8c4e8',
        margin: '0 0 20px',
    },
    checkoutBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '8px',
        border: 'none',
        background: '#fff',
        color: '#0a1628',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '0.3px',
    },
    checkoutBtnDisabled: {
        width: '100%',
        padding: '16px',
        borderRadius: '8px',
        border: 'none',
        background: '#4a6080',
        color: '#a8c4e8',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'not-allowed',
    },
    reserveBtn: {
        width: '100%',
        padding: '18px',
        borderRadius: '8px',
        border: 'none',
        background: '#0a1628',
        color: '#fff',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '0.3px',
        marginBottom: '12px',
    },
    reserveBtnDisabled: {
        width: '100%',
        padding: '18px',
        borderRadius: '8px',
        border: 'none',
        background: '#e2e8f0',
        color: '#a0aec0',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'not-allowed',
        marginBottom: '12px',
    },
    reserveNote: {
        fontSize: '13px',
        color: '#6b7a99',
        textAlign: 'center' as const,
        margin: 0,
    },
    footer: {
        background: '#0a1628',
        padding: '24px 32px',
        textAlign: 'center' as const,
        marginTop: 'auto',
    },
    footerText: {
        color: '#4a6080',
        fontSize: '13px',
        margin: 0,
        fontFamily: "'Arial', sans-serif",
    },
};

export default DropPage;