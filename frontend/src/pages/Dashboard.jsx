import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import authService from '../services/authService';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [categoryStats, setCategoryStats] = useState([]);
    const [areaStats, setAreaStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [overviewRes, categoryRes, areaRes] = await Promise.all([
                analyticsService.getOverview(),
                analyticsService.getByCategory(),
                analyticsService.getByArea(),
            ]);

            if (overviewRes.success) setStats(overviewRes.data);
            if (categoryRes.success) setCategoryStats(categoryRes.data);
            if (areaRes.success) setAreaStats(areaRes.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="spinner spinner-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="mb-4">
                <h1>📊 Dashboard</h1>
                <p style={{ color: 'var(--gray-600)' }}>
                    ยินดีต้อนรับ, <strong>{user.full_name}</strong>
                </p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-4 mb-4">
                    <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                        <h3 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>{stats.total_issues || 0}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>ปัญหาทั้งหมด</p>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <h3 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>{stats.new_issues || 0}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>ปัญหาใหม่</p>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                        <h3 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>{stats.in_progress_issues || 0}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>กำลังดำเนินการ</p>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <h3 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>{stats.resolved_issues || 0}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>แก้ไขแล้ว</p>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card mb-4">
                <h2>⚡ เมนูด่วน</h2>
                <div className="flex gap-2">
                    {user.role === 'CITIZEN' && (
                        <>
                            <Link to="/submit-issue" className="btn btn-primary">
                                ➕ แจ้งปัญหาใหม่
                            </Link>
                            <Link to="/my-issues" className="btn btn-outline">
                                📋 ปัญหาของฉัน
                            </Link>
                        </>
                    )}
                    {(user.role === 'COORDINATOR' || user.role === 'ADMIN') && (
                        <Link to="/issues" className="btn btn-primary">
                            📝 จัดการปัญหาทั้งหมด
                        </Link>
                    )}
                    {user.role === 'ADMIN' && (
                        <>
                            <Link to="/users" className="btn btn-outline">
                                👥 จัดการผู้ใช้
                            </Link>
                            <Link to="/categories" className="btn btn-outline">
                                🏷️ จัดการหมวดหมู่
                            </Link>
                            <Link to="/areas" className="btn btn-outline">
                                📍 จัดการพื้นที่
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2">
                {/* Category Statistics */}
                <div className="card">
                    <h2>📊 สถิติตามหมวดหมู่</h2>
                    {categoryStats.length > 0 ? (
                        <div>
                            {categoryStats.slice(0, 5).map((cat) => (
                                <div key={cat.id} className="mb-3" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
                                    <div className="flex justify-between items-center mb-1">
                                        <strong>{cat.name_th}</strong>
                                        <span className="badge badge-new">{cat.total_issues} ปัญหา</span>
                                    </div>
                                    <div style={{ background: 'var(--gray-200)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                background: 'linear-gradient(90deg, var(--primary-blue), var(--primary-orange))',
                                                height: '100%',
                                                width: `${Math.min((cat.total_issues / (stats?.total_issues || 1)) * 100, 100)}%`,
                                                transition: 'width 0.3s ease'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex gap-2 mt-1" style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        <span>ใหม่: {cat.new_issues}</span>
                                        <span>ดำเนินการ: {cat.in_progress_issues}</span>
                                        <span>แก้ไข: {cat.resolved_issues}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--gray-500)' }}>ยังไม่มีข้อมูล</p>
                    )}
                </div>

                {/* Area Statistics */}
                <div className="card">
                    <h2>📍 สถิติตามพื้นที่</h2>
                    {areaStats.length > 0 ? (
                        <div>
                            {areaStats.slice(0, 5).map((area) => (
                                <div key={area.id} className="mb-3" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div>
                                            <strong>{area.name_th}</strong>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                                {area.province} - {area.district}
                                            </div>
                                        </div>
                                        <span className="badge badge-new">{area.total_issues} ปัญหา</span>
                                    </div>
                                    <div style={{ background: 'var(--gray-200)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                background: 'linear-gradient(90deg, var(--success), var(--info))',
                                                height: '100%',
                                                width: `${Math.min((area.total_issues / (stats?.total_issues || 1)) * 100, 100)}%`,
                                                transition: 'width 0.3s ease'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex gap-2 mt-1" style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        <span>ใหม่: {area.new_issues}</span>
                                        <span>ดำเนินการ: {area.in_progress_issues}</span>
                                        <span>แก้ไข: {area.resolved_issues}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--gray-500)' }}>ยังไม่มีข้อมูล</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
