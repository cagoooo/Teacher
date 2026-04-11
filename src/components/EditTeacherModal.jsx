import React, { useState, useEffect } from 'react';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import { updateTeacher } from '../services/firestore';
import { X, Save } from 'lucide-react';

const EditTeacherModal = ({ teacher, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '專任教師',
        subject: '',
        phone: '',
        email: '',
        notes: ''
    });

    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name || '',
                role: teacher.role || '專任教師',
                subject: teacher.subject || '',
                phone: teacher.phone || '',
                email: teacher.email || '',
                notes: teacher.notes || ''
            });
        }
    }, [teacher]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateTeacher(teacher.id, formData);
            onSuccess?.();
            onClose();
        } catch (error) {
            alert('更新失敗：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <Card style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-text)' }}>編輯教師資料</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="var(--color-text)" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="姓名"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="例如：王小明"
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500', marginLeft: '4px' }}>職務</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '2px solid #eee',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-main)',
                                    outline: 'none',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="專任教師">專任教師</option>
                                <option value="代理教師">代理教師</option>
                                <option value="代課教師">代課教師</option>
                                <option value="兼任教師">兼任教師</option>
                                <option value="行政人員">行政人員</option>
                            </select>
                        </div>

                        <Input
                            label="任教科目"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="例如：國文、數學"
                        />

                        <Input
                            label="聯絡電話"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0912-345-678"
                        />

                        <Input
                            label="電子郵件"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="teacher@school.edu.tw"
                        />

                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500', marginLeft: '4px', display: 'block', marginBottom: '8px' }}>備註</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '2px solid #eee',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-main)',
                                    outline: 'none',
                                    backgroundColor: '#fff',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="其他補充說明..."
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>取消</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            <Save size={18} />
                            {loading ? '儲存中...' : '儲存變更'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default EditTeacherModal;
