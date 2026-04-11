import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { getLeaveRecords, addLeaveRecord, updateLeaveRecord, deleteLeaveRecord } from '../services/leaveRecords';
import { getTeachers } from '../services/firestore';
import { addSubstitution } from '../services/substitutions';
import { Plus, Calendar, Clock, User, ChevronRight, X, Check, Trash2, Briefcase } from 'lucide-react';

const OfficialProxy = () => {
    const [leaveRecords, setLeaveRecords] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [records, teacherList] = await Promise.all([
                getLeaveRecords({ leaveType: '公假' }),
                getTeachers()
            ]);
            // 過濾需要代理的請假單（通常是較長期的公假）
            const proxyRecords = records.filter(r => {
                const start = new Date(r.startDate);
                const end = new Date(r.endDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                return days >= 3; // 3天以上需要代理
            });
            setLeaveRecords(proxyRecords);
            setTeachers(teacherList);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = leaveRecords.filter(record => {
        if (filter === 'all') return true;
        return record.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'var(--color-macaron-yellow)';
            case 'approved': return 'var(--color-macaron-blue)';
            case 'completed': return 'var(--color-macaron-green)';
            case 'cancelled': return '#ccc';
            default: return '#ccc';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return '待處理';
            case 'approved': return '代理中';
            case 'completed': return '已完成';
            case 'cancelled': return '已取消';
            default: return status;
        }
    };

    const formatDateRange = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()} (${days}天)`;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-text)', fontWeight: '800' }}>公假代理管理</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-light)' }}>管理長期公假的職務代理安排</p>
                </div>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    新增代理案
                </Button>
            </div>

            {/* 說明卡片 */}
            <Card style={{ marginBottom: '24px', borderLeft: '4px solid var(--color-macaron-purple)', backgroundColor: '#faf5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Briefcase size={24} color="var(--color-macaron-purple)" />
                    <div>
                        <strong>什麼是職務代理？</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#666' }}>
                            當教師因公假（研習、出差等）離開 3 天以上，需指派代理人處理職務工作。
                        </p>
                    </div>
                </div>
            </Card>

            {/* 篩選標籤 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: '全部' },
                    { key: 'pending', label: '待處理' },
                    { key: 'approved', label: '代理中' },
                    { key: 'completed', label: '已完成' }
                ].map(item => (
                    <button
                        key={item.key}
                        onClick={() => setFilter(item.key)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: filter === item.key ? 'var(--color-macaron-purple)' : '#f0f0f0',
                            color: filter === item.key ? 'white' : 'var(--color-text)',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontFamily: 'var(--font-main)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>載入中...</div>
            ) : filteredRecords.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '60px' }}>
                    <Briefcase size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                    <p style={{ color: '#888', marginBottom: '16px' }}>目前沒有需要代理的公假案</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>3 天以上的公假才會顯示在此</p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredRecords.map(record => (
                        <Card key={record.id} style={{
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                            onClick={() => {
                                setSelectedRecord(record);
                                setShowAssignModal(true);
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '6px',
                                height: '100%',
                                backgroundColor: getStatusColor(record.status)
                            }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--color-macaron-purple)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem'
                                    }}>
                                        {record.teacherName?.[0] || '?'}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.1rem' }}>
                                            {record.teacherName}
                                        </h3>
                                        <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>
                                            {record.reason || '公假'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                                        <Calendar size={16} />
                                        <span>{formatDateRange(record.startDate, record.endDate)}</span>
                                    </div>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '12px',
                                        backgroundColor: `${getStatusColor(record.status)}20`,
                                        color: getStatusColor(record.status),
                                        fontWeight: '600',
                                        fontSize: '0.85rem'
                                    }}>
                                        {getStatusText(record.status)}
                                    </span>
                                    <ChevronRight size={20} color="#ccc" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* 新增代理案 Modal */}
            {showAddModal && (
                <AddProxyModal
                    teachers={teachers}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchData();
                        setShowAddModal(false);
                    }}
                />
            )}

            {/* 指派代理人 Modal */}
            {showAssignModal && selectedRecord && (
                <AssignProxyModal
                    record={selectedRecord}
                    teachers={teachers}
                    onClose={() => {
                        setShowAssignModal(false);
                        setSelectedRecord(null);
                    }}
                    onSuccess={() => {
                        fetchData();
                        setShowAssignModal(false);
                        setSelectedRecord(null);
                    }}
                />
            )}
        </div>
    );
};

// 新增代理案 Modal
const AddProxyModal = ({ teachers, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        teacherId: '',
        teacherName: '',
        leaveType: '公假',
        startDate: '',
        endDate: '',
        periods: [1, 2, 3, 4, 5, 6, 7], // 代理通常是全天
        reason: ''
    });

    const handleTeacherChange = (e) => {
        const teacherId = e.target.value;
        const teacher = teachers.find(t => t.id === teacherId);
        setFormData(prev => ({
            ...prev,
            teacherId,
            teacherName: teacher?.name || ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.teacherId || !formData.startDate || !formData.endDate) {
            alert('請填寫完整資料');
            return;
        }
        setLoading(true);
        try {
            await addLeaveRecord(formData);
            onSuccess();
        } catch (error) {
            alert('新增失敗：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <Card style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-text)' }}>新增公假代理案</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="var(--color-text)" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500', display: 'block', marginBottom: '8px' }}>請假教師</label>
                            <select
                                value={formData.teacherId}
                                onChange={handleTeacherChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '2px solid #eee',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-main)',
                                    outline: 'none'
                                }}
                            >
                                <option value="">請選擇教師</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Input
                                label="開始日期"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                required
                            />
                            <Input
                                label="結束日期"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                required
                            />
                        </div>

                        <Input
                            label="公假原因"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="例如：參加研習、帶隊出賽"
                        />
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <Button type="button" variant="outline" onClick={onClose}>取消</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? '新增中...' : '確認新增'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

// 指派代理人 Modal
const AssignProxyModal = ({ record, teachers, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [proxyTeacherId, setProxyTeacherId] = useState('');

    const handleSubmit = async () => {
        if (!proxyTeacherId) {
            alert('請選擇代理人');
            return;
        }

        const proxyTeacher = teachers.find(t => t.id === proxyTeacherId);
        setLoading(true);
        try {
            await addSubstitution({
                leaveRecordId: record.id,
                originalTeacherId: record.teacherId,
                originalTeacherName: record.teacherName,
                substituteTeacherId: proxyTeacherId,
                substituteTeacherName: proxyTeacher?.name || '',
                date: record.startDate,
                period: 0, // 代理不分節次
                leaveType: record.leaveType,
                type: '代理',
                hourlyRate: 0 // 代理通常不另計鐘點費
            });
            await updateLeaveRecord(record.id, { status: 'approved' });
            onSuccess();
        } catch (error) {
            alert('指派失敗：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await updateLeaveRecord(record.id, { status: 'completed' });
            onSuccess();
        } catch (error) {
            alert('更新失敗：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('確定要刪除這筆代理案嗎？')) return;
        setLoading(true);
        try {
            await deleteLeaveRecord(record.id);
            onSuccess();
        } catch (error) {
            alert('刪除失敗：' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDateRange = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return `${s.toLocaleDateString()} ~ ${e.toLocaleDateString()} (${days}天)`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <Card style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-text)' }}>指派代理人</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="var(--color-text)" />
                    </button>
                </div>

                <div style={{
                    padding: '16px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '12px',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <User size={20} color="var(--color-macaron-purple)" />
                        <span style={{ fontWeight: '600' }}>{record.teacherName}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                        <span>📅 {formatDateRange(record.startDate, record.endDate)}</span>
                        <span>📝 {record.reason || '公假'}</span>
                    </div>
                </div>

                {record.status === 'pending' && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                            指派代理人
                        </label>
                        <select
                            value={proxyTeacherId}
                            onChange={(e) => setProxyTeacherId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '2px solid #eee',
                                fontSize: '1rem',
                                fontFamily: 'var(--font-main)'
                            }}
                        >
                            <option value="">請選擇代理人</option>
                            {teachers.filter(t => t.id !== record.teacherId).map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={loading}
                        style={{ color: '#e53935', borderColor: '#e53935' }}
                    >
                        <Trash2 size={16} /> 刪除
                    </Button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button variant="outline" onClick={onClose} disabled={loading}>取消</Button>
                        {record.status === 'pending' ? (
                            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? '處理中...' : '確認指派'}
                            </Button>
                        ) : record.status === 'approved' ? (
                            <Button variant="primary" onClick={handleComplete} disabled={loading}>
                                <Check size={16} /> 標記完成
                            </Button>
                        ) : null}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default OfficialProxy;
