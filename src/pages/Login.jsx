import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('登入失敗：' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
            padding: '20px'
        }}>
            <Card style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-macaron-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    color: 'white',
                    boxShadow: '0 10px 20px rgba(179, 158, 181, 0.4)'
                }}>
                    <LogIn size={40} />
                </div>

                <h1 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>歡迎回來！</h1>
                <p style={{ color: '#888', marginBottom: '32px' }}>請登入以管理代課代理系統</p>

                {error && <div style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '0.9rem'
                }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="電子郵件"
                        type="email"
                        placeholder="name@school.edu.tw"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="密碼"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        style={{ width: '100%', marginTop: '16px' }}
                        disabled={loading}
                    >
                        {loading ? '登入中...' : '登入'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Login;
