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
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🛍️ Limited Drop</h1>
                <h2 style={styles.subtitle}>{isLogin ? 'Login' : 'Register'}</h2>

                {error && <div style={styles.error}>{error}</div>}

                {!isLogin && (
                    <input
                        style={styles.input}
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                )}

                <input
                    style={styles.input}
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    style={styles.input}
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    style={styles.button}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
                </button>

                <p style={styles.toggle}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <span
                        style={styles.link}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    title: { textAlign: 'center', fontSize: '28px', margin: 0 },
    subtitle: { textAlign: 'center', fontSize: '18px', margin: 0, color: '#555' },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
        outline: 'none',
    },
    button: {
        padding: '14px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    error: {
        background: '#ffe0e0',
        color: '#c00',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '14px',
    },
    toggle: { textAlign: 'center', fontSize: '14px', color: '#555' },
    link: { color: '#667eea', cursor: 'pointer', fontWeight: 'bold' },
};

export default LoginPage;