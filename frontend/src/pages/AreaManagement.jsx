import { useState, useEffect } from 'react';
import api from '../services/api';

function AreaManagement() {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name_th: '',
        name_en: '',
        province: '',
        district: '',
        subdistrict: '',
        postal_code: '',
    });

    useEffect(() => {
        loadAreas();
    }, []);

    const loadAreas = async () => {
        try {
            const response = await api.get('/areas?active_only=false');
            if (response.data.success) {
                setAreas(response.data.data);
            }
        } catch (error) {
            console.error('Error loading areas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/areas', formData);
            setFormData({
                name_th: '',
                name_en: '',
                province: '',
                district: '',
                subdistrict: '',
                postal_code: '',
            });
            setShowForm(false);
            loadAreas();
            alert('เพิ่มพื้นที่สำเร็จ');
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || 'ไม่สามารถเพิ่มพื้นที่ได้'));
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
                <h1>📍 จัดการพื้นที่</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'ยกเลิก' : '➕ เพิ่มพื้นที่'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-3">
                    <h3>เพิ่มพื้นที่ใหม่</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2">
                            <div className="form-group">
                                <label className="form-label">ชื่อพื้นที่ (ไทย) *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name_th}
                                    onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ชื่อพื้นที่ (อังกฤษ) *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name_en}
                                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="form-group">
                                <label className="form-label">จังหวัด *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.province}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">อำเภอ</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ตำบล</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.subdistrict}
                                    onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">รหัสไปรษณีย์</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                pattern="[0-9]{5}"
                                placeholder="10500"
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
                            <th>ชื่อพื้นที่ (ไทย)</th>
                            <th>ชื่อพื้นที่ (อังกฤษ)</th>
                            <th>จังหวัด</th>
                            <th>อำเภอ</th>
                            <th>ตำบล</th>
                            <th>รหัสไปรษณีย์</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map((area) => (
                            <tr key={area.id}>
                                <td>{area.id}</td>
                                <td>{area.name_th}</td>
                                <td>{area.name_en}</td>
                                <td>{area.province}</td>
                                <td>{area.district || '-'}</td>
                                <td>{area.subdistrict || '-'}</td>
                                <td>{area.postal_code || '-'}</td>
                                <td>
                                    {area.is_active ? (
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

export default AreaManagement;
