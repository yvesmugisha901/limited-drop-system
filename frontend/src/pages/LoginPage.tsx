import { useState } from 'react';
import { login, register } from '../api';

interface LoginPageProps {
    onAuth: (token: string) => void;
}

const LoginPage = ({ onAuth }: LoginPageProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (isLogin) {
                res = await login(email, password);
            } else {
                res = await register(email, name, password);
            }
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onAuth(res.data.token);
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || 'Something went wrong');
            } else {
                setError('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.left}>
                <div style={styles.leftContent}>
                    <div style={styles.logo}>⚡</div>
                    <h1 style={styles.brand}>LimitedDrop</h1>
                    <p style={styles.tagline}>Exclusive products.<br />Limited stock.<br />Real-time drops.</p>
                    <div style={styles.features}>
                        <div style={styles.feature}>✦ Reserve in seconds</div>
                        <div style={styles.feature}>✦ 5-minute hold timer</div>
                        <div style={styles.feature}>✦ Live stock updates</div>
                    </div>
                </div>
            </div>

            <div style={styles.right}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>{isLogin ? 'Welcome back' : 'Create account'}</h2>
                    <p style={styles.cardSubtitle}>
                        {isLogin ? 'Sign in to access exclusive drops' : 'Join to access exclusive drops'}
                    </p>

                    {error && <div style={styles.error}>⚠ {error}</div>}

                    {!isLogin && (
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                style={styles.input}
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            style={styles.input}
                            placeholder="you@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button style={loading ? styles.buttonDisabled : styles.button} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
                    </button>

                    <div style={styles.divider}><span>or</span></div>

                    <p style={styles.toggle}>
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <span style={styles.link} onClick={() => { setIsLogin(!isLogin); setError(null); }}>
                            {isLogin ? 'Register' : 'Sign in'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Georgia', serif",
    },
    left: {
        flex: 1,
        background: 'linear-gradient(160deg, #0a1628 0%, #1a3a6b 60%, #0d2444 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
    },
    leftContent: {
        position: 'relative',
        zIndex: 1,
        color: '#fff',
    },
    logo: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    brand: {
        fontSize: '42px',
        fontWeight: '700',
        letterSpacing: '-1px',
        margin: '0 0 16px',
        color: '#fff',
    },
    tagline: {
        fontSize: '22px',
        lineHeight: '1.7',
        color: '#a8c4e8',
        margin: '0 0 48px',
        fontStyle: 'italic',
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    feature: {
        fontSize: '15px',
        color: '#c8daf0',
        letterSpacing: '0.5px',
    },
    right: {
        flex: 1,
        background: '#f7f9fc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 40px rgba(10,22,40,0.1)',
        border: '1px solid #e8edf5',
    },
    cardTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0a1628',
        margin: '0 0 8px',
    },
    cardSubtitle: {
        fontSize: '15px',
        color: '#6b7a99',
        margin: '0 0 32px',
    },
    fieldGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#0a1628',
        marginBottom: '8px',
        letterSpacing: '0.3px',
        textTransform: 'uppercase' as const,
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1.5px solid #dde3ef',
        fontSize: '15px',
        color: '#0a1628',
        background: '#f7f9fc',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s',
    },
    button: {
        width: '100%',
        padding: '14px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #1a3a6b, #0d2444)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        letterSpacing: '0.3px',
        marginTop: '8px',
    },
    buttonDisabled: {
        width: '100%',
        padding: '14px',
        borderRadius: '8px',
        border: 'none',
        background: '#a0aec0',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'not-allowed',
        marginTop: '8px',
    },
    error: {
        background: '#fff5f5',
        border: '1px solid #fed7d7',
        color: '#c53030',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '20px',
    },
    divider: {
        textAlign: 'center' as const,
        margin: '24px 0',
        color: '#a0aec0',
        fontSize: '13px',
        position: 'relative' as const,
    },
    toggle: {
        textAlign: 'center' as const,
        fontSize: '14px',
        color: '#6b7a99',
        margin: 0,
    },
    link: {
        color: '#1a3a6b',
        cursor: 'pointer',
        fontWeight: '700',
        textDecoration: 'underline',
    },
};

export default LoginPage;