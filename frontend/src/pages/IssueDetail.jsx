import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import issueService from '../services/issueService';
import authService from '../services/authService';

function IssueDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const user = authService.getCurrentUser();

    useEffect(() => {
        loadIssue();
    }, [id]);

    const loadIssue = async () => {
        try {
            const response = await issueService.getById(id);
            if (response.success) {
                setIssue(response.data);
                setNewStatus(response.data.status);
            }
        } catch (error) {
            console.error('Error loading issue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            alert('กรุณาใส่ความคิดเห็น');
            return;
        }

        setSubmitting(true);
        try {
            await issueService.updateStatus(id, newStatus, comment);
            setComment('');
            loadIssue();
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || 'ไม่สามารถอัพเดตสถานะได้'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            await issueService.addComment(id, comment);
            setComment('');
            loadIssue();
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || 'ไม่สามารถเพิ่มความคิดเห็นได้'));
        } finally {
            setSubmitting(false);
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

    if (!issue) {
        return (
            <div className="container">
                <div className="card text-center">
                    <h2>ไม่พบข้อมูลปัญหา</h2>
                    <button onClick={() => navigate(-1)} className="btn btn-primary">
                        กลับ
                    </button>
                </div>
            </div>
        );
    }

    const canManage = user.role === 'ADMIN' || user.role === 'COORDINATOR';

    return (
        <div className="container">
            <button onClick={() => navigate(-1)} className="btn btn-outline mb-3">
                ← กลับ
            </button>

            <div className="grid grid-cols-3">
                {/* Main Content */}
                <div style={{ gridColumn: 'span 2' }}>
                    <div className="card mb-3">
                        <div className="flex justify-between items-start mb-3">
                            <h1 style={{ margin: 0 }}>{issue.title}</h1>
                            {getStatusBadge(issue.status)}
                        </div>

                        <div className="flex gap-3 mb-3" style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                            <span>👤 {issue.user_name}</span>
                            <span>🏷️ {issue.category_name_th}</span>
                            <span>📍 {issue.area_name_th}, {issue.province}</span>
                            <span>📅 {new Date(issue.created_at).toLocaleDateString('th-TH')}</span>
                        </div>

                        <div className="mb-3" style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{issue.description}</p>
                        </div>

                        {issue.latitude && issue.longitude && (
                            <div className="mb-3">
                                <strong>📍 พิกัด:</strong> {issue.latitude}, {issue.longitude}
                            </div>
                        )}

                        {/* Images */}
                        {issue.images && issue.images.length > 0 && (
                            <div>
                                <h3>📷 รูปภาพประกอบ</h3>
                                <div className="grid grid-cols-3">
                                    {issue.images.map((img) => (
                                        <img
                                            key={img.id}
                                            src={`http://localhost:5000/${img.image_path}`}
                                            alt="Issue"
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                objectFit: 'cover',
                                                borderRadius: 'var(--radius)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(`http://localhost:5000/${img.image_path}`, '_blank')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Updates Timeline */}
                    <div className="card">
                        <h2>📝 ประวัติการอัพเดต</h2>
                        {issue.updates && issue.updates.length > 0 ? (
                            <div>
                                {issue.updates.map((update) => (
                                    <div
                                        key={update.id}
                                        className="mb-3 p-3"
                                        style={{
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--radius)',
                                            borderLeft: '4px solid var(--primary-blue)'
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <strong>{update.user_name || 'ระบบ'}</strong>
                                            <small style={{ color: 'var(--gray-500)' }}>
                                                {new Date(update.created_at).toLocaleString('th-TH')}
                                            </small>
                                        </div>
                                        {update.status && (
                                            <div className="mb-2">
                                                เปลี่ยนสถานะเป็น: {getStatusBadge(update.status)}
                                            </div>
                                        )}
                                        <p style={{ margin: 0 }}>{update.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--gray-500)' }}>ยังไม่มีการอัพเดต</p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {canManage && (
                        <div className="card mb-3">
                            <h3>⚙️ จัดการปัญหา</h3>
                            <form onSubmit={handleStatusUpdate}>
                                <div className="form-group">
                                    <label className="form-label">เปลี่ยนสถานะ</label>
                                    <select
                                        className="form-control"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="NEW">ใหม่</option>
                                        <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                                        <option value="RESOLVED">แก้ไขแล้ว</option>
                                        <option value="CLOSED">ปิดเรื่อง</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">ความคิดเห็น *</label>
                                    <textarea
                                        className="form-control"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows="4"
                                        placeholder="เพิ่มความคิดเห็น..."
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={submitting}
                                >
                                    {submitting ? 'กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
                                </button>
                            </form>
                        </div>
                    )}

                    {!canManage && (
                        <div className="card">
                            <h3>💬 เพิ่มความคิดเห็น</h3>
                            <form onSubmit={handleAddComment}>
                                <div className="form-group">
                                    <textarea
                                        className="form-control"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows="4"
                                        placeholder="เพิ่มความคิดเห็น..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={submitting}
                                >
                                    {submitting ? 'กำลังส่ง...' : '📤 ส่งความคิดเห็น'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default IssueDetail;
