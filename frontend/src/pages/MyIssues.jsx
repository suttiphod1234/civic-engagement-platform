import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import issueService from '../services/issueService';

function MyIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadIssues();
    }, [filter]);

    const loadIssues = async () => {
        try {
            const filters = filter ? { status: filter } : {};
            const response = await issueService.getAll(filters);
            if (response.success) {
                setIssues(response.data.issues);
            }
        } catch (error) {
            console.error('Error loading issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            NEW: 'badge-new',
            IN_PROGRESS: 'badge-in-progress',
            RESOLVED: 'badge-resolved',
            CLOSED: 'badge-closed',
        };
        const labels = {
            NEW: 'ใหม่',
            IN_PROGRESS: 'กำลังดำเนินการ',
            RESOLVED: 'แก้ไขแล้ว',
            CLOSED: 'ปิดเรื่อง',
        };
        return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
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
            <div className="flex justify-between items-center mb-4">
                <h1>📋 ปัญหาของฉัน</h1>
                <Link to="/submit-issue" className="btn btn-primary">
                    ➕ แจ้งปัญหาใหม่
                </Link>
            </div>

            <div className="card mb-3">
                <div className="flex gap-2">
                    <button
                        className={`btn btn-sm ${filter === '' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('')}
                    >
                        ทั้งหมด
                    </button>
                    <button
                        className={`btn btn-sm ${filter === 'NEW' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('NEW')}
                    >
                        ใหม่
                    </button>
                    <button
                        className={`btn btn-sm ${filter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('IN_PROGRESS')}
                    >
                        กำลังดำเนินการ
                    </button>
                    <button
                        className={`btn btn-sm ${filter === 'RESOLVED' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('RESOLVED')}
                    >
                        แก้ไขแล้ว
                    </button>
                </div>
            </div>

            {issues.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                    <h3>ยังไม่มีปัญหาที่แจ้ง</h3>
                    <p style={{ color: 'var(--gray-600)' }}>
                        คลิกปุ่ม "แจ้งปัญหาใหม่" เพื่อเริ่มต้น
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1">
                    {issues.map((issue) => (
                        <Link
                            key={issue.id}
                            to={`/issues/${issue.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="card" style={{ marginBottom: '1rem' }}>
                                <div className="flex justify-between items-start">
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ marginBottom: '0.5rem' }}>{issue.title}</h3>
                                        <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                                            {issue.description.substring(0, 150)}
                                            {issue.description.length > 150 ? '...' : ''}
                                        </p>
                                        <div className="flex gap-2" style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                            <span>🏷️ {issue.category_name_th}</span>
                                            <span>📍 {issue.area_name_th}</span>
                                            <span>📅 {new Date(issue.created_at).toLocaleDateString('th-TH')}</span>
                                            {issue.image_count > 0 && <span>📷 {issue.image_count} รูป</span>}
                                        </div>
                                    </div>
                                    <div>
                                        {getStatusBadge(issue.status)}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyIssues;
