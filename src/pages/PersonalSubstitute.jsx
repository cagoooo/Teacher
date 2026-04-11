import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { getLeaveRecords, addLeaveRecord, updateLeaveRecord, deleteLeaveRecord } from '../services/leaveRecords';
import { getTeachers } from '../services/firestore';
import { addSubstitution } from '../services/substitutions';
import { Plus, Calendar, Clock, User, ChevronRight, X, Check, Trash2, AlertCircle } from 'lucide-react';

const PersonalSubstitute = () => {
    const [leaveRecords, setLeaveRecords] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filter, setFilter] = useState('all');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('all'); // all, 事假, 病假

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
            setLeaveRecords([...sickRecords, ...personalRecords].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            ));
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
            case 'cancelled': return '#ccc';
            default: return '#ccc';
        }
    };

    const getLeaveTypeColor = (type) => {
        switch (type) {
            case '事假': return 'var(--color-macaron-orange)';
            case '病假': return 'var(--color-macaron-pink)';
            default: return '#ccc';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return '待處理';
            case 'approved': return '已核准';
            case 'completed': return '已完成';
            case 'cancelled': return '已取消';
            default: return status;
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-text)', fontWeight: '800' }}>事病假代課管理</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-light)' }}>處理教師事假與病假的代課安排</p>
                </div>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    新增請假單
                </Button>
            </div>

            {/* 緊急提示 */}
            {leaveRecords.filter(r => r.status === 'pending').length > 0 && (
                <Card style={{
                    marginBottom: '24px',
                    borderLeft: '4px solid var(--color-macaron-pink)',
                    backgroundColor: '#fff5f5'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={24} color="var(--color-macaron-pink)" />
                        <div>
                            <strong>有 {leaveRecords.filter(r => r.status === 'pending').length} 筆待處理的請假單</strong>
                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#888' }}>請盡快安排代課教師</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* 假別篩選 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: '全部假別' },
                    { key: '事假', label: '事假' },
                    { key: '病假', label: '病假' }
                ].map(item => (
                    <button
                        key={item.key}
                        onClick={() => setLeaveTypeFilter(item.key)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: leaveTypeFilter === item.key
                                ? (item.key === '事假' ? 'var(--color-macaron-orange)' :
                                    item.key === '病假' ? 'var(--color-macaron-pink)' :
                                        'var(--color-macaron-purple)')
                                : '#f0f0f0',
                            color: leaveTypeFilter === item.key ? 'white' : 'var(--color-text)',
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

            {/* 狀態篩選 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: '全部狀態' },
                    { key: 'pending', label: '待處理' },
                    { key: 'approved', label: '已核准' },
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
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
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
                    <p style={{ color: '#888', marginBottom: '16px' }}>目前沒有事病假請假單</p>
                    <Button variant="outline" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> 新增第一筆
                    </Button>
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
                                        <span>{formatDate(record.startDate)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                                        <Clock size={16} />
                                        <span>第 {record.periods?.join(', ') || '-'} 節</span>
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

            {/* 新增請假單 Modal */}
            {showAddModal && (
                <AddPersonalLeaveModal
                    teachers={teachers}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchData();
                        setShowAddModal(false);
                    }}
                />
            )}

            {/* 代課指派 Modal */}
            {showAssignModal && selectedRecord && (
                <AssignSubstituteModal
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

// 新增事病假請假單 Modal
const AddPersonalLeaveModal = ({ teachers, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        teacherId: '',
        teacherName: '',
        leaveType: '事假',
        startDate: '',
        endDate: '',
        periods: [],
        classes: [],
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

    const handlePeriodsChange = (period) => {
        setFormData(prev => ({
            ...prev,
            periods: prev.periods.includes(period)
                ? prev.periods.filter(p => p !== period)
                : [...prev.periods, period].sort((a, b) => a - b)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.teacherId || !formData.startDate) {
            alert('請選擇教師和日期');
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
                    <h2 style={{ margin: 0, color: 'var(--color-text)' }}>新增事病假請假單</h2>
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
                                    outline: 'none',
                                    backgroundColor: '#fff'
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
                                            fontFamily: 'var(--font-main)',
                                            transition: 'all 0.2s'
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
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500', display: 'block', marginBottom: '8px' }}>受影響節次</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {[1, 2, 3, 4, 5, 6, 7].map(period => (
                                    <button
                                        key={period}
                                        type="button"
                                        onClick={() => handlePeriodsChange(period)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: formData.periods.includes(period)
                                                ? (formData.leaveType === '事假' ? 'var(--color-macaron-orange)' : 'var(--color-macaron-pink)')
                                                : '#f0f0f0',
                                            color: formData.periods.includes(period) ? 'white' : '#666',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontFamily: 'var(--font-main)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="請假原因"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="例如：家中有事、身體不適"
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

// 代課指派 Modal (共用)
const AssignSubstituteModal = ({ record, teachers, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [assignments, setAssignments] = useState({});

    const handleAssign = (period, teacherId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        setAssignments(prev => ({
            ...prev,
            [period]: {
                substituteTeacherId: teacherId,
                substituteTeacherName: teacher?.name || ''
            }
        }));
    };

    const handleSubmit = async () => {
        const periods = Object.keys(assignments).filter(p => assignments[p]?.substituteTeacherId);
        if (periods.length === 0) {
            alert('請至少指派一節課的代課教師');
            return;
        }

        setLoading(true);
        try {
            for (const period of periods) {
                await addSubstitution({
                    leaveRecordId: record.id,
                    originalTeacherId: record.teacherId,
                    originalTeacherName: record.teacherName,
                    substituteTeacherId: assignments[period].substituteTeacherId,
                    substituteTeacherName: assignments[period].substituteTeacherName,
                    date: record.startDate,
                    period: parseInt(period),
                    leaveType: record.leaveType,
                    type: '代課',
                    hourlyRate: 450
                });
            }
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
        if (!confirm('確定要刪除這筆請假單嗎？')) return;
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

    const leaveTypeColor = record.leaveType === '事假' ? 'var(--color-macaron-orange)' : 'var(--color-macaron-pink)';

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
            <Card style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-text)' }}>代課指派</h2>
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
                    <div style={{ display: 'flex', gap: '24px', color: '#666', fontSize: '0.9rem' }}>
                        <span>📅 {new Date(record.startDate).toLocaleDateString()}</span>
                        <span>📝 {record.reason || '無說明'}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px', color: 'var(--color-text)' }}>指派代課教師</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(record.periods || []).map(period => (
                            <div key={period} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px',
                                backgroundColor: assignments[period] ? '#e8f5e9' : '#fff',
                                border: '1px solid #eee',
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: leaveTypeColor,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {period}
                                </div>
                                <span style={{ color: '#666' }}>第 {period} 節</span>
                                <div style={{ flex: 1 }}>
                                    <select
                                        value={assignments[period]?.substituteTeacherId || ''}
                                        onChange={(e) => handleAssign(period, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            fontSize: '0.95rem',
                                            fontFamily: 'var(--font-main)'
                                        }}
                                    >
                                        <option value="">選擇代課教師</option>
                                        {teachers.filter(t => t.id !== record.teacherId).map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {assignments[period] && (
                                    <Check size={20} color="var(--color-macaron-green)" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={loading}
                        style={{ color: '#e53935', borderColor: '#e53935' }}
                    >
                        <Trash2 size={16} />
                        刪除
                    </Button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button variant="outline" onClick={onClose} disabled={loading}>取消</Button>
                        {record.status === 'approved' ? (
                            <Button variant="primary" onClick={handleComplete} disabled={loading}>
                                <Check size={16} />
                                {loading ? '處理中...' : '標記完成'}
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? '儲存中...' : '確認指派'}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PersonalSubstitute;
