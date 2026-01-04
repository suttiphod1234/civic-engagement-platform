import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function Login({ setUser }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(formData);
            if (response.success) {
                setUser(response.data.user);
                navigate('/dashboard');
            } else {
                setError(response.message || 'เข้าสู่ระบบไม่สำเร็จ');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏛️ Civic Engagement</h1>
                    <p style={{ color: 'var(--gray-600)' }}>เข้าสู่ระบบรับฟังเสียงประชาชน</p>
                </div>

                {error && (
                    <div className="alert alert-error mb-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">อีเมล</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="example@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">รหัสผ่าน</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mb-3"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: '1rem', height: '1rem' }}></span>
                                กำลังเข้าสู่ระบบ...
                            </>
                        ) : (
                            '🔐 เข้าสู่ระบบ'
                        )}
                    </button>

                    <div className="text-center">
                        <p style={{ color: 'var(--gray-600)' }}>
                            ยังไม่มีบัญชี? {' '}
                            <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="mt-4 p-3" style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: 0 }}>
                        <strong>ทดสอบระบบ:</strong><br />
                        Email: admin@civic.local<br />
                        Password: admin123
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
