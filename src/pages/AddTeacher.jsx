import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { addTeacher } from '../services/firestore';
import { UserPlus, ArrowLeft } from 'lucide-react';

const AddTeacher = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '專任教師',
        subject: '',
        phone: '',
        email: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addTeacher(formData);
            alert('新增成功！');
            navigate('/teachers');
        } catch (error) {
            alert('新增失敗：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <Button variant="outline" size="small" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> 返回
                </Button>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--color-text)' }}>新增教師</h1>
            </div>

            <Card>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '32px',
                    padding: '16px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '12px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-macaron-green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--color-text)' }}>基本資料</h3>
                        <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.9rem' }}>請填寫教師的詳細資訊</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <Input
                            label="姓名"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="例如：王小明"
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
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
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500', marginLeft: '4px', display: 'block', marginBottom: '8px' }}>備註</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
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

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>取消</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? '儲存中...' : '確認新增'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddTeacher;
