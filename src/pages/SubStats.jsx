import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getSubstitutions } from '../services/substitutions';
import { getTeachers } from '../services/firestore';
import { Calendar, Download, User, TrendingUp, Award, DollarSign } from 'lucide-react';

const SubStats = () => {
    const [substitutions, setSubstitutions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [subs, teacherList] = await Promise.all([
                getSubstitutions({ year: selectedYear, month: selectedMonth }),
                getTeachers()
            ]);
            setSubstitutions(subs);
            setTeachers(teacherList);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubs = leaveTypeFilter === 'all'
        ? substitutions
        : substitutions.filter(s => s.leaveType === leaveTypeFilter);

    // 計算每位教師的代課統計
    const teacherStats = teachers.map(teacher => {
        const teacherSubs = filteredSubs.filter(s => s.substituteTeacherId === teacher.id);
        const officialCount = teacherSubs.filter(s => s.leaveType === '公假').length;
        const personalCount = teacherSubs.filter(s => s.leaveType === '事假').length;
        const sickCount = teacherSubs.filter(s => s.leaveType === '病假').length;
        const totalAmount = teacherSubs.reduce((sum, s) => sum + (s.hourlyRate || 450), 0);
        const unpaidAmount = teacherSubs.filter(s => !s.isPaid).reduce((sum, s) => sum + (s.hourlyRate || 450), 0);

        return {
            ...teacher,
            officialCount,
            personalCount,
            sickCount,
            totalCount: teacherSubs.length,
            totalAmount,
            unpaidAmount
        };
    }).filter(t => t.totalCount > 0).sort((a, b) => b.totalCount - a.totalCount);

    const totalStats = {
        totalSubs: filteredSubs.length,
        totalAmount: filteredSubs.reduce((sum, s) => sum + (s.hourlyRate || 450), 0),
        teacherCount: teacherStats.length,
        avgPerTeacher: teacherStats.length > 0 ? Math.round(filteredSubs.length / teacherStats.length * 10) / 10 : 0
    };

    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1} 月` }));

    // 匯出 CSV
    const exportCSV = () => {
        const headers = ['教師姓名', '職務', '公假代課', '事假代課', '病假代課', '總計', '鐘點費', '未核銷'];
        const rows = teacherStats.map(t => [
            t.name, t.role, t.officialCount, t.personalCount, t.sickCount,
            t.totalCount, t.totalAmount, t.unpaidAmount
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `代課統計_${selectedYear}年${selectedMonth}月.csv`;
        a.click();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-text)', fontWeight: '800' }}>代課者統計報表</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-light)' }}>追蹤教師代課次數與鐘點費統計</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #ddd', fontFamily: 'var(--font-main)' }}
                    >
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y} 年</option>)}
                    </select>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #ddd', fontFamily: 'var(--font-main)' }}
                    >
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <Button variant="secondary" onClick={exportCSV}>
                        <Download size={18} /> 匯出
                    </Button>
                </div>
            </div>

            {/* 總覽卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--color-macaron-blue), var(--color-macaron-purple))', color: 'white' }}>
                    <TrendingUp size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.totalSubs}</div>
                    <div style={{ opacity: 0.9 }}>總代課節數</div>
                </Card>
                <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--color-macaron-green), var(--color-macaron-blue))', color: 'white' }}>
                    <DollarSign size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>${totalStats.totalAmount.toLocaleString()}</div>
                    <div style={{ opacity: 0.9 }}>總鐘點費</div>
                </Card>
                <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--color-macaron-orange), var(--color-macaron-pink))', color: 'white' }}>
                    <User size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.teacherCount}</div>
                    <div style={{ opacity: 0.9 }}>代課教師數</div>
                </Card>
                <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--color-macaron-yellow), var(--color-macaron-orange))', color: 'white' }}>
                    <Award size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.avgPerTeacher}</div>
                    <div style={{ opacity: 0.9 }}>平均節數/人</div>
                </Card>
            </div>

            {/* 假別篩選 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { key: 'all', label: '全部', color: 'var(--color-macaron-blue)' },
                    { key: '公假', label: '公假代課', color: 'var(--color-macaron-purple)' },
                    { key: '事假', label: '事假代課', color: 'var(--color-macaron-orange)' },
                    { key: '病假', label: '病假代課', color: 'var(--color-macaron-pink)' }
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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>載入中...</div>
            ) : teacherStats.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '60px' }}>
                    <Calendar size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                    <p style={{ color: '#888' }}>{selectedYear} 年 {selectedMonth} 月沒有代課紀錄</p>
                </Card>
            ) : (
                <>
                    {/* 代課冠軍 */}
                    {teacherStats[0] && (
                        <Card style={{
                            marginBottom: '24px',
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                <Award size={48} style={{ opacity: 0.9 }} />
                                <div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>🏆 本月代課冠軍</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{teacherStats[0].name}</div>
                                </div>
                                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{teacherStats[0].totalCount} 節</div>
                                    <div style={{ opacity: 0.9 }}>${teacherStats[0].totalAmount.toLocaleString()}</div>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card>
                        <h3 style={{ margin: '0 0 20px', color: 'var(--color-text)' }}>代課次數排行</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', width: '50px' }}>排名</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>教師</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>公假</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>事假</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>病假</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>總計</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>鐘點費</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>未核銷</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teacherStats.map((teacher, index) => (
                                        <tr key={teacher.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '16px 12px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#f0f0f0',
                                                    color: index < 3 ? 'white' : '#666',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--color-macaron-green)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {teacher.name[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{teacher.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{teacher.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                {teacher.officialCount > 0 ? (
                                                    <span style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: '#f3e5f5', color: 'var(--color-macaron-purple)', fontWeight: '600' }}>
                                                        {teacher.officialCount}
                                                    </span>
                                                ) : <span style={{ color: '#ccc' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                {teacher.personalCount > 0 ? (
                                                    <span style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: '#fff3e0', color: 'var(--color-macaron-orange)', fontWeight: '600' }}>
                                                        {teacher.personalCount}
                                                    </span>
                                                ) : <span style={{ color: '#ccc' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                {teacher.sickCount > 0 ? (
                                                    <span style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: '#fce4ec', color: 'var(--color-macaron-pink)', fontWeight: '600' }}>
                                                        {teacher.sickCount}
                                                    </span>
                                                ) : <span style={{ color: '#ccc' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    backgroundColor: 'var(--color-macaron-blue)',
                                                    color: 'white',
                                                    fontWeight: '600'
                                                }}>
                                                    {teacher.totalCount}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--color-macaron-green)' }}>
                                                ${teacher.totalAmount.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                                {teacher.unpaidAmount > 0 ? (
                                                    <span style={{ color: 'var(--color-macaron-orange)', fontWeight: '600' }}>
                                                        ${teacher.unpaidAmount.toLocaleString()}
                                                    </span>
                                                ) : <span style={{ color: '#ccc' }}>—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default SubStats;
