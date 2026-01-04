import { useState, useEffect } from 'react';
import api from '../services/api';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/users');
            if (response.data.success) {
                setUsers(response.data.data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!confirm(`ต้องการเปลี่ยนบทบาทเป็น ${newRole} ใช่หรือไม่?`)) return;

        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            loadUsers();
            alert('เปลี่ยนบทบาทสำเร็จ');
        } catch (error) {
            alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || 'ไม่สามารถเปลี่ยนบทบาทได้'));
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            ADMIN: 'badge-urgent',
            COORDINATOR: 'badge-in-progress',
            CITIZEN: 'badge-new',
        };
        const labels = {
            ADMIN: 'ผู้ดูแลระบบ',
            COORDINATOR: 'ผู้ประสานงาน',
            CITIZEN: 'ประชาชน',
        };
        return <span className={`badge ${colors[role]}`}>{labels[role]}</span>;
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
            <h1>👥 จัดการผู้ใช้</h1>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>อีเมล</th>
                            <th>เบอร์โทร</th>
                            <th>บทบาท</th>
                            <th>สถานะ</th>
                            <th>วันที่สมัคร</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.full_name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || '-'}</td>
                                <td>{getRoleBadge(user.role)}</td>
                                <td>
                                    {user.is_active ? (
                                        <span className="badge badge-resolved">ใช้งาน</span>
                                    ) : (
                                        <span className="badge badge-closed">ระงับ</span>
                                    )}
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                                <td>
                                    <select
                                        className="form-control"
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                                    >
                                        <option value="CITIZEN">ประชาชน</option>
                                        <option value="COORDINATOR">ผู้ประสานงาน</option>
                                        <option value="ADMIN">ผู้ดูแลระบบ</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserManagement;
