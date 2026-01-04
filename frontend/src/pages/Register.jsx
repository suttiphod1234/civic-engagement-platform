import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function Register({ setUser }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
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

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (formData.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await authService.register(registerData);

            if (response.success) {
                setUser(response.data.user);
                navigate('/dashboard');
            } else {
                setError(response.message || 'สมัครสมาชิกไม่สำเร็จ');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝 สมัครสมาชิก</h1>
                    <p style={{ color: 'var(--gray-600)' }}>สร้างบัญชีเพื่อแจ้งปัญหาชุมชน</p>
                </div>

                {error && (
                    <div className="alert alert-error mb-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">ชื่อ-นามสกุล *</label>
                        <input
                            type="text"
                            name="full_name"
                            className="form-control"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            placeholder="นายสมชาย ใจดี"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">อีเมล *</label>
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
                        <label className="form-label">เบอร์โทรศัพท์</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0812345678"
                            pattern="[0-9]{10}"
                        />
                        <small style={{ color: 'var(--gray-500)' }}>ตัวเลข 10 หลัก</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">รหัสผ่าน *</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            minLength="6"
                        />
                        <small style={{ color: 'var(--gray-500)' }}>อย่างน้อย 6 ตัวอักษร</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">ยืนยันรหัสผ่าน *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            value={formData.confirmPassword}
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
                                กำลังสมัครสมาชิก...
                            </>
                        ) : (
                            '✅ สมัครสมาชิก'
                        )}
                    </button>

                    <div className="text-center">
                        <p style={{ color: 'var(--gray-600)' }}>
                            มีบัญชีอยู่แล้ว? {' '}
                            <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
