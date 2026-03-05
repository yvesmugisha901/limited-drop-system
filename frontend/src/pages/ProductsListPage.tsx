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

    if (loading) return <div style={styles.center}>Loading products...</div>;
    if (error) return <div style={styles.center}>{error}</div>;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>🛍️ Limited Drops</h1>
                <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div style={styles.center}>No products available</div>
            ) : (
                <div style={styles.grid}>
                    {products.map((product) => {
                        const isSoldOut = product.currentStock === 0;
                        const stockPercent = (product.currentStock / product.totalStock) * 100;

                        return (
                            <div key={product.id} style={styles.card}>
                                {product.imageUrl && (
                                    <img src={product.imageUrl} alt={product.name} style={styles.image} />
                                )}
                                {!product.imageUrl && (
                                    <div style={styles.imagePlaceholder}>🛍️</div>
                                )}
                                <div style={styles.cardBody}>
                                    <h2 style={styles.productName}>{product.name}</h2>
                                    <p style={styles.description}>{product.description}</p>
                                    <p style={styles.price}>${product.price.toFixed(2)}</p>

                                    {/* Stock Bar */}
                                    <div style={styles.stockSection}>
                                        <div style={styles.stockLabel}>
                                            <span>Stock</span>
                                            <span style={{ color: isSoldOut ? '#e00' : '#333' }}>
                                                {product.currentStock} / {product.totalStock}
                                            </span>
                                        </div>
                                        <div style={styles.stockBarBg}>
                                            <div style={{
                                                ...styles.stockBarFill,
                                                width: `${stockPercent}%`,
                                                background: stockPercent > 50 ? '#4caf50' : stockPercent > 20 ? '#ff9800' : '#f44336',
                                            }} />
                                        </div>
                                    </div>

                                    <button
                                        style={{
                                            ...styles.btn,
                                            background: isSoldOut ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            cursor: isSoldOut ? 'not-allowed' : 'pointer',
                                        }}
                                        onClick={() => !isSoldOut && onSelectProduct(product.id)}
                                        disabled={isSoldOut}
                                    >
                                        {isSoldOut ? '❌ Sold Out' : '🛒 View Drop'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
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
        maxWidth: '1000px',
        margin: '0 auto 24px',
    },
    title: { fontSize: '28px', margin: 0 },
    logoutBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        background: '#eee',
        cursor: 'pointer',
        fontSize: '14px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    image: { width: '100%', height: '200px', objectFit: 'cover' },
    imagePlaceholder: {
        width: '100%',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
        background: '#f0f0f0',
    },
    cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
    productName: { fontSize: '20px', margin: 0 },
    description: { color: '#666', margin: 0, fontSize: '14px' },
    price: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
    stockSection: { display: 'flex', flexDirection: 'column', gap: '6px' },
    stockLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
    stockBarBg: { height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' },
    stockBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
    btn: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 'bold',
    },
};

export default ProductsListPage;