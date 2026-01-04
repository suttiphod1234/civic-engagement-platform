import { useState, useEffect } from 'react';
import api from '../services/api';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name_th: '',
        name_en: '',
        description: '',
        icon: '',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await api.get('/categories?active_only=false');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', formData);
            setFormData({ name_th: '', name_en: '', description: '', icon: '' });
            setShowForm(false);
            loadCategories();
            alert('เพิ่มหมวดหมู่สำเร็จ');
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || 'ไม่สามารถเพิ่มหมวดหมู่ได้'));
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
            <div className="flex justify-between items-center mb-4">
                <h1>🏷️ จัดการหมวดหมู่</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'ยกเลิก' : '➕ เพิ่มหมวดหมู่'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-3">
                    <h3>เพิ่มหมวดหมู่ใหม่</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2">
                            <div className="form-group">
                                <label className="form-label">ชื่อภาษาไทย *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name_th}
                                    onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ชื่อภาษาอังกฤษ *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name_en}
                                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">คำอธิบาย</label>
                            <textarea
                                className="form-control"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label className="form-label">ไอคอน (emoji)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="🏗️"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            💾 บันทึก
                        </button>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ไอคอน</th>
                            <th>ชื่อภาษาไทย</th>
                            <th>ชื่อภาษาอังกฤษ</th>
                            <th>คำอธิบาย</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                                <td>{cat.name_th}</td>
                                <td>{cat.name_en}</td>
                                <td>{cat.description}</td>
                                <td>
                                    {cat.is_active ? (
                                        <span className="badge badge-resolved">ใช้งาน</span>
                                    ) : (
                                        <span className="badge badge-closed">ระงับ</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CategoryManagement;
