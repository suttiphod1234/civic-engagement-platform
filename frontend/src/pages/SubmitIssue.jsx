import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import issueService from '../services/issueService';
import api from '../services/api';

function SubmitIssue() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        area_id: '',
        latitude: '',
        longitude: '',
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadFormData();
    }, []);

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError('สามารถอัพโหลดได้สูงสุด 5 รูปภาพ');
            return;
        }
        setImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category_id', formData.category_id);
            submitData.append('area_id', formData.area_id);
            if (formData.latitude) submitData.append('latitude', formData.latitude);
            if (formData.longitude) submitData.append('longitude', formData.longitude);

            images.forEach((image) => {
                submitData.append('images', image);
            });

            const response = await issueService.create(submitData);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/my-issues');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการแจ้งปัญหา');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container">
                <div className="card text-center" style={{ maxWidth: '500px', margin: '4rem auto' }}>
                    <div style={{ fontSize: '4rem' }}>✅</div>
                    <h2>แจ้งปัญหาสำเร็จ!</h2>
                    <p style={{ color: 'var(--gray-600)' }}>
                        ระบบได้บันทึกปัญหาของคุณเรียบร้อยแล้ว<br />
                        กำลังนำคุณไปยังหน้าปัญหาของฉัน...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1>➕ แจ้งปัญหาชุมชน</h1>
                <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
                    กรุณากรอกรายละเอียดปัญหาที่พบให้ครบถ้วน
                </p>

                {error && (
                    <div className="alert alert-error mb-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">หัวข้อปัญหา *</label>
                        <input
                            type="text"
                            name="title"
                            className="form-control"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="เช่น ถนนชำรุด ไฟฟ้าดับ ขยะล้นถัง"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">รายละเอียดปัญหา *</label>
                        <textarea
                            name="description"
                            className="form-control"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="5"
                            placeholder="อธิบายปัญหาโดยละเอียด..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2">
                        <div className="form-group">
                            <label className="form-label">หมวดหมู่ *</label>
                            <select
                                name="category_id"
                                className="form-control"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- เลือกหมวดหมู่ --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name_th}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">พื้นที่ *</label>
                            <select
                                name="area_id"
                                className="form-control"
                                value={formData.area_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- เลือกพื้นที่ --</option>
                                {areas.map((area) => (
                                    <option key={area.id} value={area.id}>
                                        {area.name_th} ({area.province})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2">
                        <div className="form-group">
                            <label className="form-label">ละติจูด (ไม่บังคับ)</label>
                            <input
                                type="number"
                                name="latitude"
                                className="form-control"
                                value={formData.latitude}
                                onChange={handleChange}
                                step="0.000001"
                                placeholder="13.7563"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">ลองจิจูด (ไม่บังคับ)</label>
                            <input
                                type="number"
                                name="longitude"
                                className="form-control"
                                value={formData.longitude}
                                onChange={handleChange}
                                step="0.000001"
                                placeholder="100.5018"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">รูปภาพประกอบ (สูงสุด 5 รูป)</label>
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleImageChange}
                            accept="image/jpeg,image/png,image/jpg"
                            multiple
                        />
                        {images.length > 0 && (
                            <small style={{ color: 'var(--success)' }}>
                                เลือกแล้ว {images.length} รูป
                            </small>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: '1rem', height: '1rem' }}></span>
                                    กำลังส่งข้อมูล...
                                </>
                            ) : (
                                '📤 ส่งข้อมูล'
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate('/dashboard')}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubmitIssue;
