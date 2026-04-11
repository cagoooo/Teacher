import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getLeaveRecords } from '../services/leaveRecords';
import { getTeachers } from '../services/firestore';
import { Calendar, Filter, Download, User, TrendingDown, PieChart } from 'lucide-react';

const LeaveStats = () => {
    const [leaveRecords, setLeaveRecords] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [records, teacherList] = await Promise.all([
                getLeaveRecords(),
                getTeachers()
            ]);
            setLeaveRecords(records);
            setTeachers(teacherList);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // 按月份和類型篩選
    const filteredRecords = leaveRecords.filter(record => {
        const recordDate = new Date(record.startDate);
        const monthMatch = recordDate.getMonth() + 1 === selectedMonth && recordDate.getFullYear() === selectedYear;
        const typeMatch = leaveTypeFilter === 'all' || record.leaveType === leaveTypeFilter;
        return monthMatch && typeMatch;
    });

    // 計算每位教師的請假統計
    const teacherStats = teachers.map(teacher => {
        const teacherRecords = filteredRecords.filter(r => r.teacherId === teacher.id);
        const officialCount = teacherRecords.filter(r => r.leaveType === '公假').length;
        const personalCount = teacherRecords.filter(r => r.leaveType === '事假').length;
        const sickCount = teacherRecords.filter(r => r.leaveType === '病假').length;
        const totalPeriods = teacherRecords.reduce((sum, r) => sum + (r.periods?.length || 0), 0);

        return {
            ...teacher,
            officialCount,
            personalCount,
            sickCount,
            totalCount: officialCount + personalCount + sickCount,
            totalPeriods
        };
    }).filter(t => t.totalCount > 0).sort((a, b) => b.totalCount - a.totalCount);

    // 總計統計
    const totalStats = {
        official: filteredRecords.filter(r => r.leaveType === '公假').length,
        personal: filteredRecords.filter(r => r.leaveType === '事假').length,
        sick: filteredRecords.filter(r => r.leaveType === '病假').length,
        total: filteredRecords.length,
        teacherCount: teacherStats.length
    };

    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1} 月` }));

    const getLeaveTypeColor = (type) => {
        switch (type) {
            case '公假': return 'var(--color-macaron-purple)';
            case '事假': return 'var(--color-macaron-orange)';
            case '病假': return 'var(--color-macaron-pink)';
            default: return '#ccc';
        }
    };

    // 匯出 CSV
    const exportCSV = () => {
        const headers = ['教師姓名', '職務', '公假次數', '事假次數', '病假次數', '總計', '影響節數'];
        const rows = teacherStats.map(t => [
            t.name, t.role, t.officialCount, t.personalCount, t.sickCount, t.totalCount, t.totalPeriods
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `請假統計_${selectedYear}年${selectedMonth}月.csv`;
        a.click();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-text)', fontWeight: '800' }}>請假者統計報表</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-light)' }}>分析教師請假頻率與類型分布</p>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <Card style={{ textAlign: 'center', background: 'var(--color-macaron-purple)', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.official}</div>
                    <div style={{ opacity: 0.9 }}>公假</div>
                </Card>
                <Card style={{ textAlign: 'center', background: 'var(--color-macaron-orange)', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.personal}</div>
                    <div style={{ opacity: 0.9 }}>事假</div>
                </Card>
                <Card style={{ textAlign: 'center', background: 'var(--color-macaron-pink)', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.sick}</div>
                    <div style={{ opacity: 0.9 }}>病假</div>
                </Card>
                <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--color-macaron-blue), var(--color-macaron-green))', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.total}</div>
                    <div style={{ opacity: 0.9 }}>總計</div>
                </Card>
            </div>

            {/* 假別篩選 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { key: 'all', label: '全部', color: 'var(--color-macaron-blue)' },
                    { key: '公假', label: '公假', color: 'var(--color-macaron-purple)' },
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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>載入中...</div>
            ) : teacherStats.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '60px' }}>
                    <Calendar size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                    <p style={{ color: '#888' }}>{selectedYear} 年 {selectedMonth} 月沒有請假紀錄</p>
                </Card>
            ) : (
                <Card>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--color-text)' }}>
                        <TrendingDown size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        請假次數統計
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>教師</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>公假</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>事假</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>病假</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>總計</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>影響節數</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teacherStats.map(teacher => (
                                    <tr key={teacher.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--color-macaron-blue)',
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
                                        <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '700', color: 'var(--color-text)' }}>
                                            {teacher.totalCount}
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center', color: '#888' }}>
                                            {teacher.totalPeriods} 節
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default LeaveStats;
