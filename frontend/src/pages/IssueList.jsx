import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import issueService from '../services/issueService';
import api from '../services/api';

function IssueList() {
    const [issues, setIssues] = useState([]);
    const [categories, setCategories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        category_id: '',
        area_id: '',
        search: '',
    });

    useEffect(() => {
        loadFormData();
    }, []);

    useEffect(() => {
        loadIssues();
    }, [filters]);

    const loadFormData = async () => {
        try {
            const [catRes, areaRes] = await Promise.all([
                api.get('/categories'),
                api.get('/areas'),
            ]);
            if (catRes.data.success) setCategories(catRes.data.data);
            if (areaRes.data.success) setAreas(areaRes.data.data);
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    };

    const loadIssues = async () => {
        setLoading(true);
        try {
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

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
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

    return (
        <div className="container">
            <h1>📝 จัดการปัญหาทั้งหมด</h1>

            {/* Filters */}
            <div className="card mb-3">
                <div className="grid grid-cols-4">
                    <div className="form-group">
                        <label className="form-label">ค้นหา</label>
                        <input
                            type="text"
                            name="search"
                            className="form-control"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="ค้นหาปัญหา..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">สถานะ</label>
                        <select
                            name="status"
                            className="form-control"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">ทั้งหมด</option>
                            <option value="NEW">ใหม่</option>
                            <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                            <option value="RESOLVED">แก้ไขแล้ว</option>
                            <option value="CLOSED">ปิดเรื่อง</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">หมวดหมู่</label>
                        <select
                            name="category_id"
                            className="form-control"
                            value={filters.category_id}
                            onChange={handleFilterChange}
                        >
                            <option value="">ทั้งหมด</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name_th}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">พื้นที่</label>
                        <select
                            name="area_id"
                            className="form-control"
                            value={filters.area_id}
                            onChange={handleFilterChange}
                        >
                            <option value="">ทั้งหมด</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.name_th}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Issues List */}
            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="spinner spinner-primary"></div>
                </div>
            ) : issues.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                    <h3>ไม่พบปัญหาที่ตรงกับเงื่อนไข</h3>
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
                                            <span>👤 {issue.user_name}</span>
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

export default IssueList;
