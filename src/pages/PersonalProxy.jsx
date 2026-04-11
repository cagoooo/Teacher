import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { getLeaveRecords, addLeaveRecord, updateLeaveRecord, deleteLeaveRecord } from '../services/leaveRecords';
import { getTeachers } from '../services/firestore';
import { addSubstitution } from '../services/substitutions';
import { Plus, Calendar, User, ChevronRight, X, Check, Trash2, Briefcase, AlertCircle } from 'lucide-react';

const PersonalProxy = () => {
    const [leaveRecords, setLeaveRecords] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filter, setFilter] = useState('all');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sickRecords, personalRecords, teacherList] = await Promise.all([
                getLeaveRecords({ leaveType: '病假' }),
                getLeaveRecords({ leaveType: '事假' }),
                getTeachers()
            ]);

            // 過濾需要代理的請假單（3天以上）
            const allRecords = [...sickRecords, ...personalRecords];
            const proxyRecords = allRecords.filter(r => {
                const start = new Date(r.startDate);
                const end = new Date(r.endDate || r.startDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                return days >= 3;
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setLeaveRecords(proxyRecords);
            setTeachers(teacherList);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = leaveRecords.filter(record => {
        const statusMatch = filter === 'all' || record.status === filter;
        const typeMatch = leaveTypeFilter === 'all' || record.leaveType === leaveTypeFilter;
        return statusMatch && typeMatch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'var(--color-macaron-yellow)';
            case 'approved': return 'var(--color-macaron-blue)';
            case 'completed': return 'var(--color-macaron-green)';
            default: return '#ccc';
        }
    };

    const getLeaveTypeColor = (type) => {
        return type === '事假' ? 'var(--color-macaron-orange)' : 'var(--color-macaron-pink)';
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return '待處理';
            case 'approved': return '代理中';
            case 'completed': return '已完成';
            default: return status;
        }
    };

    const formatDateRange = (start, end) => {
        const s = new Date(start);
        const e = new Date(end || start);
        const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()} (${days}天)`;
    };

    const pendingCount = leaveRecords.filter(r => r.status === 'pending').length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-text)', fontWeight: '800' }}>事病假代理管理</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-light)' }}>管理長期事病假的職務代理安排</p>
                </div>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    新增代理案
                </Button>
            </div>

            {/* 緊急待處理提示 */}
            {pendingCount > 0 && (
                <Card style={{
                    marginBottom: '24px',
                    borderLeft: '4px solid var(--color-macaron-pink)',
                    backgroundColor: '#fff5f5'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={24} color="var(--color-macaron-pink)" />
                        <div>
                            <strong>有 {pendingCount} 筆待處理的代理案</strong>
                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#888' }}>請盡快指派代理人</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* 假別篩選 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: '全部假別', color: 'var(--color-macaron-blue)' },
                    { key: '事假', label: '事假', color: 'var(--color-macaron-orange)' },
                    { key: '病假', label: '病假', color: 'var(--color-macaron-pink)' }
                ].map(item => (
                    <button
                        key={item.key}
                        onClick={() => setLeaveTypeFilter(item.key)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: leaveTypeFilter === item.key ? item.color : '#f0f0f0',
                            color: leaveTypeFilter === item.key ? 'white' : '#666',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontFamily: 'var(--font-main)'
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 狀態篩選 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: '全部狀態' },
                    { key: 'pending', label: '待處理' },
                    { key: 'approved', label: '代理中' },
                    { key: 'completed', label: '已完成' }
                ].map(item => (
                    <button
                        key={item.key}
                        onClick={() => setFilter(item.key)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            border: '1px solid #ddd',
                            backgroundColor: filter === item.key ? '#f0f0f0' : 'transparent',
                            color: '#666',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontFamily: 'var(--font-main)'
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
                    <p style={{ color: '#888', marginBottom: '16px' }}>目前沒有需要代理的事病假案</p>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>3 天以上的事病假才會顯示在此</p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredRecords.map(record => (
                        <Card key={record.id} style={{
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer'
                        }}
                            onClick={() => {
                                setSelectedRecord(record);
                                setShowAssignModal(true);
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: '6px',
                                height: '100%',
                                backgroundColor: getLeaveTypeColor(record.leaveType)
                            }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: getLeaveTypeColor(record.leaveType),
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
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: `${getLeaveTypeColor(record.leaveType)}20`,
                                                color: getLeaveTypeColor(record.leaveType),
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}>
                                                {record.leaveType}
                                            </span>
                                            <span style={{ color: '#888', fontSize: '0.9rem' }}>
                                                {record.reason || '無說明'}
                                            </span>
                                        </div>
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

// 新增事病假代理案 Modal
const AddProxyModal = ({ teachers, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        teacherId: '',
        teacherName: '',
        leaveType: '事假',
        startDate: '',
        endDate: '',
        periods: [1, 2, 3, 4, 5, 6, 7],
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

    const leaveTypeColor = formData.leaveType === '事假' ? 'var(--color-macaron-orange)' : 'var(--color-macaron-pink)';

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
                    <h2 style={{ margin: 0, color: 'var(--color-text)' }}>新增事病假代理案</h2>
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
                                    fontFamily: 'var(--font-main)'
                                }}
                            >
                                <option value="">請選擇教師</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500', display: 'block', marginBottom: '8px' }}>假別</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {['事假', '病假'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, leaveType: type }))}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            backgroundColor: formData.leaveType === type
                                                ? (type === '事假' ? 'var(--color-macaron-orange)' : 'var(--color-macaron-pink)')
                                                : '#f0f0f0',
                                            color: formData.leaveType === type ? 'white' : '#666',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontFamily: 'var(--font-main)'
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
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
                            label="請假原因"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="例如：家中有事、住院治療"
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

    const leaveTypeColor = record.leaveType === '事假' ? 'var(--color-macaron-orange)' : 'var(--color-macaron-pink)';

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
                period: 0,
                leaveType: record.leaveType,
                type: '代理',
                hourlyRate: 0
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
        const e = new Date(end || start);
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
                    marginBottom: '24px',
                    borderLeft: `4px solid ${leaveTypeColor}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <User size={20} color={leaveTypeColor} />
                        <span style={{ fontWeight: '600' }}>{record.teacherName}</span>
                        <span style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: `${leaveTypeColor}20`,
                            color: leaveTypeColor,
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            {record.leaveType}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                        <span>📅 {formatDateRange(record.startDate, record.endDate)}</span>
                        <span>📝 {record.reason || '無說明'}</span>
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

export default PersonalProxy;
