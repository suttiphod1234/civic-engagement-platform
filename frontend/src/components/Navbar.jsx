import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            padding: '1rem 0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
        }}>
            <div className="container">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                            🏛️ Civic Engagement
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link to="/dashboard" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                            📊 Dashboard
                        </Link>

                        {user.role === 'CITIZEN' && (
                            <>
                                <Link to="/submit-issue" className="btn btn-sm btn-secondary">
                                    ➕ แจ้งปัญหา
                                </Link>
                                <Link to="/my-issues" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                    📋 ปัญหาของฉัน
                                </Link>
                            </>
                        )}

                        {(user.role === 'COORDINATOR' || user.role === 'ADMIN') && (
                            <Link to="/issues" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                📝 จัดการปัญหา
                            </Link>
                        )}

                        {user.role === 'ADMIN' && (
                            <>
                                <Link to="/users" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                    👥 ผู้ใช้
                                </Link>
                                <Link to="/categories" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                    🏷️ หมวดหมู่
                                </Link>
                                <Link to="/areas" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                    📍 พื้นที่
                                </Link>
                            </>
                        )}

                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            color: 'white'
                        }}>
                            <strong>{user.full_name}</strong>
                            <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}>
                                ({user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : user.role === 'COORDINATOR' ? 'ผู้ประสานงาน' : 'ประชาชน'})
                            </span>
                        </div>

                        <button onClick={handleLogout} className="btn btn-sm btn-danger">
                            🚪 ออกจากระบบ
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
