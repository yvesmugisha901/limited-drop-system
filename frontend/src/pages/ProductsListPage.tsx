import { useState, useEffect } from 'react';
import { getProducts } from '../api';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currentStock: number;
    totalStock: number;
    imageUrl?: string;
}

interface Props {
    onSelectProduct: (productId: string) => void;
    onLogout: () => void;
}

const ProductsListPage = ({ onSelectProduct, onLogout }: Props) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await getProducts();
                setProducts(res.data);
            } catch {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return (
        <div style={styles.fullCenter}>
            <div style={styles.spinner}>⟳</div>
            <p style={styles.loadingText}>Loading drops...</p>
        </div>
    );

    if (error) return (
        <div style={styles.fullCenter}>
            <p style={{ color: '#c53030' }}>{error}</p>
        </div>
    );

    return (
        <div style={styles.page}>
            {/* Navbar */}
            <nav style={styles.nav}>
                <div style={styles.navInner}>
                    <div style={styles.navBrand}>
                        <span style={styles.navLogo}>⚡</span>
                        <span style={styles.navTitle}>LimitedDrop</span>
                    </div>
                    <button style={styles.logoutBtn} onClick={onLogout}>Sign Out</button>
                </div>
            </nav>

            {/* Hero */}
            <div style={styles.hero}>
                <div style={styles.heroInner}>
                    <p style={styles.heroEyebrow}>EXCLUSIVE RELEASES</p>
                    <h1 style={styles.heroTitle}>Today's Drops</h1>
                    <p style={styles.heroSubtitle}>
                        Limited stock. Reserve yours before time runs out.
                    </p>
                </div>
            </div>

            {/* Products */}
            <div style={styles.main}>
                {products.length === 0 ? (
                    <div style={styles.empty}>
                        <p style={styles.emptyText}>No drops available right now.</p>
                        <p style={styles.emptySubtext}>Check back soon for exclusive releases.</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {products.map((product) => {
                            const isSoldOut = product.currentStock === 0;
                            const stockPercent = (product.currentStock / product.totalStock) * 100;
                            const isLow = stockPercent <= 20 && !isSoldOut;

                            return (
                                <div key={product.id} style={styles.card}>
                                    {/* Badge */}
                                    {isSoldOut && <div style={styles.badgeSoldOut}>SOLD OUT</div>}
                                    {isLow && <div style={styles.badgeLow}>ALMOST GONE</div>}
                                    {!isSoldOut && !isLow && <div style={styles.badgeAvailable}>AVAILABLE</div>}

                                    {/* Image */}
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} style={styles.image} />
                                    ) : (
                                        <div style={{
                                            ...styles.imagePlaceholder,
                                            opacity: isSoldOut ? 0.5 : 1,
                                        }}>
                                            <span style={styles.placeholderIcon}>⚡</span>
                                        </div>
                                    )}

                                    {/* Body */}
                                    <div style={styles.cardBody}>
                                        <div style={styles.cardTop}>
                                            <h2 style={{
                                                ...styles.productName,
                                                color: isSoldOut ? '#a0aec0' : '#0a1628',
                                            }}>
                                                {product.name}
                                            </h2>
                                            <p style={styles.price}>${product.price.toFixed(2)}</p>
                                        </div>

                                        <p style={styles.description}>{product.description}</p>

                                        {/* Stock */}
                                        <div style={styles.stockSection}>
                                            <div style={styles.stockLabel}>
                                                <span style={styles.stockText}>Stock remaining</span>
                                                <span style={{
                                                    ...styles.stockCount,
                                                    color: isSoldOut ? '#c53030' : isLow ? '#dd6b20' : '#276749',
                                                }}>
                                                    {product.currentStock} / {product.totalStock}
                                                </span>
                                            </div>
                                            <div style={styles.stockBarBg}>
                                                <div style={{
                                                    ...styles.stockBarFill,
                                                    width: `${stockPercent}%`,
                                                    background: isSoldOut
                                                        ? '#e2e8f0'
                                                        : isLow
                                                            ? '#dd6b20'
                                                            : '#1a3a6b',
                                                }} />
                                            </div>
                                        </div>

                                        {/* Button */}
                                        <button
                                            style={isSoldOut ? styles.btnDisabled : styles.btn}
                                            onClick={() => !isSoldOut && onSelectProduct(product.id)}
                                            disabled={isSoldOut}
                                        >
                                            {isSoldOut ? 'Sold Out' : 'Reserve Now →'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Georgia', serif",
        gap: '12px',
    },
    spinner: {
        fontSize: '40px',
        animation: 'spin 1s linear infinite',
        color: '#1a3a6b',
    },
    loadingText: {
        fontSize: '16px',
        color: '#6b7a99',
        margin: 0,
    },
    nav: {
        background: '#0a1628',
        borderBottom: '1px solid #1a3a6b',
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
    logoutBtn: {
        padding: '8px 20px',
        borderRadius: '6px',
        border: '1px solid #a8c4e8',
        background: 'transparent',
        color: '#a8c4e8',
        fontSize: '14px',
        cursor: 'pointer',
        letterSpacing: '0.3px',
    },
    hero: {
        background: 'linear-gradient(160deg, #0a1628 0%, #1a3a6b 100%)',
        padding: '64px 32px',
        color: '#fff',
    },
    heroInner: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    heroEyebrow: {
        fontSize: '12px',
        letterSpacing: '3px',
        color: '#a8c4e8',
        margin: '0 0 12px',
        fontFamily: "'Arial', sans-serif",
    },
    heroTitle: {
        fontSize: '52px',
        fontWeight: '700',
        margin: '0 0 16px',
        letterSpacing: '-2px',
        lineHeight: 1.1,
    },
    heroSubtitle: {
        fontSize: '18px',
        color: '#a8c4e8',
        margin: 0,
        fontStyle: 'italic',
    },
    main: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 32px',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box' as const,
    },
    empty: {
        textAlign: 'center' as const,
        padding: '80px 0',
    },
    emptyText: {
        fontSize: '22px',
        color: '#0a1628',
        fontWeight: '600',
        margin: '0 0 8px',
    },
    emptySubtext: {
        fontSize: '15px',
        color: '#6b7a99',
        margin: 0,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '28px',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e8edf5',
        boxShadow: '0 2px 20px rgba(10,22,40,0.06)',
        overflow: 'hidden',
        position: 'relative' as const,
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    badgeAvailable: {
        position: 'absolute' as const,
        top: '16px',
        left: '16px',
        background: '#1a3a6b',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        padding: '4px 10px',
        borderRadius: '4px',
        fontFamily: "'Arial', sans-serif",
    },
    badgeLow: {
        position: 'absolute' as const,
        top: '16px',
        left: '16px',
        background: '#dd6b20',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        padding: '4px 10px',
        borderRadius: '4px',
        fontFamily: "'Arial', sans-serif",
    },
    badgeSoldOut: {
        position: 'absolute' as const,
        top: '16px',
        left: '16px',
        background: '#718096',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.5px',
        padding: '4px 10px',
        borderRadius: '4px',
        fontFamily: "'Arial', sans-serif",
    },
    image: {
        width: '100%',
        height: '220px',
        objectFit: 'cover' as const,
    },
    imagePlaceholder: {
        width: '100%',
        height: '220px',
        background: 'linear-gradient(135deg, #0a1628, #1a3a6b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIcon: {
        fontSize: '56px',
    },
    cardBody: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
    },
    productName: {
        fontSize: '20px',
        fontWeight: '700',
        margin: 0,
        lineHeight: 1.3,
        flex: 1,
    },
    price: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#1a3a6b',
        margin: 0,
        whiteSpace: 'nowrap' as const,
    },
    description: {
        fontSize: '14px',
        color: '#6b7a99',
        margin: 0,
        lineHeight: 1.6,
    },
    stockSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    stockLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stockText: {
        fontSize: '12px',
        color: '#6b7a99',
        letterSpacing: '0.5px',
        fontFamily: "'Arial', sans-serif",
        textTransform: 'uppercase' as const,
    },
    stockCount: {
        fontSize: '13px',
        fontWeight: '700',
        fontFamily: "'Arial', sans-serif",
    },
    stockBarBg: {
        height: '4px',
        background: '#e8edf5',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    stockBarFill: {
        height: '100%',
        borderRadius: '2px',
        transition: 'width 0.5s ease',
    },
    btn: {
        padding: '14px',
        borderRadius: '8px',
        border: 'none',
        background: '#0a1628',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        letterSpacing: '0.3px',
        transition: 'background 0.2s',
    },
    btnDisabled: {
        padding: '14px',
        borderRadius: '8px',
        border: 'none',
        background: '#e2e8f0',
        color: '#a0aec0',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'not-allowed',
        letterSpacing: '0.3px',
    },
    footer: {
        background: '#0a1628',
        padding: '24px 32px',
        textAlign: 'center' as const,
    },
    footerText: {
        color: '#4a6080',
        fontSize: '13px',
        margin: 0,
        fontFamily: "'Arial', sans-serif",
    },
};

export default ProductsListPage;