import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getTeachers } from '../services/firestore';
import { getSubstitutions } from '../services/substitutions';
import { Clock, User, DollarSign, Calendar, TrendingUp, Filter } from 'lucide-react';

const OvertimeTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [substitutions, setSubstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [teacherList, subList] = await Promise.all([
                getTeachers(),
                getSubstitutions({ month: selectedMonth, year: selectedYear })
            ]);
            setTeachers(teacherList);
            setSubstitutions(subList);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // 計算每位教師的代課時數統計
    const teacherStats = teachers.map(teacher => {
        const teacherSubs = substitutions.filter(s => s.substituteTeacherId === teacher.id);
        const totalHours = teacherSubs.length;
        const totalAmount = teacherSubs.reduce((sum, s) => sum + (s.hourlyRate || 450), 0);
        const unpaidCount = teacherSubs.filter(s => !s.isPaid).length;

        return {
            ...teacher,
            totalHours,
            totalAmount,
            unpaidCount,
            substitutions: teacherSubs
        };
    }).filter(t => t.totalHours > 0).sort((a, b) => b.totalHours - a.totalHours);

    const totalStats = {
        totalHours: teacherStats.reduce((sum, t) => sum + t.totalHours, 0),
        totalAmount: teacherStats.reduce((sum, t) => sum + t.totalAmount, 0),
        teacherCount: teacherStats.length
    };

    const months = [
        { value: 1, label: '一月' },
        { value: 2, label: '二月' },
        { value: 3, label: '三月' },
        { value: 4, label: '四月' },
        { value: 5, label: '五月' },
        { value: 6, label: '六月' },
        { value: 7, label: '七月' },
        { value: 8, label: '八月' },
        { value: 9, label: '九月' },
        { value: 10, label: '十月' },
        { value: 11, label: '十一月' },
        { value: 12, label: '十二月' }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-text)', fontWeight: '800' }}>超鐘點教師管理</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-light)' }}>追蹤教師代課時數與鐘點費統計</p>
                </div>

                {/* 月份選擇 */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Filter size={18} color="#888" />
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid #ddd',
                            fontSize: '0.95rem',
                            fontFamily: 'var(--font-main)'
                        }}
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y} 年</option>
                        ))}
                    </select>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid #ddd',
                            fontSize: '0.95rem',
                            fontFamily: 'var(--font-main)'
                        }}
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 總覽統計卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--color-macaron-blue) 0%, var(--color-macaron-purple) 100%)', color: 'white' }}>
                    <Clock size={32} style={{ marginBottom: '8px', opacity: 0.9 }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.totalHours}</div>
                    <div style={{ opacity: 0.9 }}>總代課節數</div>
                </Card>
                <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--color-macaron-green) 0%, var(--color-macaron-blue) 100%)', color: 'white' }}>
                    <DollarSign size={32} style={{ marginBottom: '8px', opacity: 0.9 }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>${totalStats.totalAmount.toLocaleString()}</div>
                    <div style={{ opacity: 0.9 }}>總鐘點費</div>
                </Card>
                <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--color-macaron-orange) 0%, var(--color-macaron-pink) 100%)', color: 'white' }}>
                    <User size={32} style={{ marginBottom: '8px', opacity: 0.9 }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800' }}>{totalStats.teacherCount}</div>
                    <div style={{ opacity: 0.9 }}>代課教師數</div>
                </Card>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>載入中...</div>
            ) : teacherStats.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '60px' }}>
                    <Calendar size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                    <p style={{ color: '#888' }}>{selectedYear} 年 {selectedMonth} 月沒有代課紀錄</p>
                </Card>
            ) : (
                <Card>
                    <h3 style={{ margin: '0 0 20px', color: 'var(--color-text)' }}>
                        <TrendingUp size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        代課時數排行
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>排名</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>教師</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>代課節數</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>鐘點費</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>未核銷</th>
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
                                                backgroundColor: index === 0 ? '#FFD700' :
                                                    index === 1 ? '#C0C0C0' :
                                                        index === 2 ? '#CD7F32' : '#f0f0f0',
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
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--color-macaron-purple)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {teacher.name[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{teacher.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{teacher.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '16px',
                                                backgroundColor: 'var(--color-macaron-blue)',
                                                color: 'white',
                                                fontWeight: '600'
                                            }}>
                                                {teacher.totalHours} 節
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--color-macaron-green)' }}>
                                            ${teacher.totalAmount.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            {teacher.unpaidCount > 0 ? (
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#fff3e0',
                                                    color: 'var(--color-macaron-orange)',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {teacher.unpaidCount} 筆
                                                </span>
                                            ) : (
                                                <span style={{ color: '#ccc' }}>—</span>
                                            )}
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

export default OvertimeTeachers;
