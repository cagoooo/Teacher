import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getTeachers } from '../services/firestore';
import { Calendar, Clock, Users, Plus, ChevronLeft, ChevronRight, Save } from 'lucide-react';

/**
 * 鐘點教師排課頁面
 * 用於管理鐘點教師的課表安排
 */
const HourlyTeachersSchedule = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(0);

    const weekDays = ['週一', '週二', '週三', '週四', '週五'];
    const periods = [
        { id: 1, time: '08:10-08:55', label: '第一節' },
        { id: 2, time: '09:05-09:50', label: '第二節' },
        { id: 3, time: '10:00-10:45', label: '第三節' },
        { id: 4, time: '10:55-11:40', label: '第四節' },
        { id: 5, time: '13:10-13:55', label: '第五節' },
        { id: 6, time: '14:05-14:50', label: '第六節' },
        { id: 7, time: '15:00-15:45', label: '第七節' },
    ];

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const teacherList = await getTeachers();
            // 篩選鐘點教師
            const hourlyTeachers = teacherList.filter(t =>
                t.role === '鐘點教師' || t.employmentType === '鐘點'
            );
            setTeachers(hourlyTeachers);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDateRange = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4);

        return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
    };

    return (
        <div>
            {/* 頁面標題 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2rem',
                        color: 'var(--color-text)',
                        fontWeight: '800',
                        fontFamily: 'var(--font-display)'
                    }}>
                        鐘點教師排課
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-light)' }}>
                        管理鐘點教師的課表安排與時段分配
                    </p>
                </div>

                <Button variant="accent" icon={<Plus size={18} />}>
                    新增排課
                </Button>
            </div>

            {/* 週次導航 */}
            <Card
                animationDelay={0}
                style={{ marginBottom: '24px' }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px'
                }}>
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={() => setCurrentWeek(currentWeek - 1)}
                        icon={<ChevronLeft size={20} />}
                    />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: 'var(--color-text)',
                            fontFamily: 'var(--font-display)'
                        }}>
                            {currentWeek === 0 ? '本週' : currentWeek > 0 ? `${currentWeek} 週後` : `${Math.abs(currentWeek)} 週前`}
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: 'var(--color-text-light)',
                            marginTop: '4px'
                        }}>
                            {getWeekDateRange()}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={() => setCurrentWeek(currentWeek + 1)}
                        icon={<ChevronRight size={20} />}
                    />
                    {currentWeek !== 0 && (
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => setCurrentWeek(0)}
                        >
                            回到本週
                        </Button>
                    )}
                </div>
            </Card>

            {/* 教師選擇與課表 */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
                {/* 教師列表 */}
                <Card
                    title="鐘點教師"
                    titleIcon={<Users size={20} />}
                    variant="info"
                    animationDelay={100}
                >
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            載入中...
                        </div>
                    ) : teachers.length === 0 ? (
                        <div style={{
                            padding: '30px',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                            background: 'rgba(74, 111, 165, 0.05)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <Users size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                            <p style={{ margin: 0 }}>尚無鐘點教師資料</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {teachers.map(teacher => (
                                <button
                                    key={teacher.id}
                                    onClick={() => setSelectedTeacher(teacher)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        border: selectedTeacher?.id === teacher.id
                                            ? '2px solid var(--color-primary)'
                                            : '2px solid transparent',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: selectedTeacher?.id === teacher.id
                                            ? 'rgba(74, 111, 165, 0.1)'
                                            : 'var(--color-surface)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(145deg, var(--color-primary) 0%, var(--color-info) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>
                                        {teacher.name[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                                            {teacher.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                            {teacher.subject || '未設定科目'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* 課表格線 */}
                <Card
                    title="週課表"
                    titleIcon={<Calendar size={20} />}
                    variant="default"
                    animationDelay={200}
                >
                    {selectedTeacher ? (
                        <>
                            <div style={{
                                marginBottom: '16px',
                                padding: '12px',
                                background: 'rgba(74, 111, 165, 0.08)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Clock size={16} color="var(--color-primary)" />
                                <span style={{ fontWeight: '600' }}>{selectedTeacher.name}</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>的課表</span>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    minWidth: '600px'
                                }}>
                                    <thead>
                                        <tr>
                                            <th style={{
                                                padding: '12px',
                                                backgroundColor: 'rgba(74, 111, 165, 0.08)',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                color: 'var(--color-text-light)'
                                            }}>
                                                節次
                                            </th>
                                            {weekDays.map(day => (
                                                <th key={day} style={{
                                                    padding: '12px',
                                                    backgroundColor: 'rgba(74, 111, 165, 0.08)',
                                                    fontWeight: '600',
                                                    textAlign: 'center'
                                                }}>
                                                    {day}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {periods.map(period => (
                                            <tr key={period.id}>
                                                <td style={{
                                                    padding: '12px',
                                                    borderBottom: '1px solid rgba(74, 111, 165, 0.1)',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    <div style={{ fontWeight: '600' }}>{period.label}</div>
                                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                                        {period.time}
                                                    </div>
                                                </td>
                                                {weekDays.map(day => (
                                                    <td
                                                        key={`${period.id}-${day}`}
                                                        style={{
                                                            padding: '8px',
                                                            borderBottom: '1px solid rgba(74, 111, 165, 0.1)',
                                                            textAlign: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all var(--transition-fast)'
                                                        }}
                                                    >
                                                        <div style={{
                                                            padding: '12px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            backgroundColor: 'rgba(74, 111, 165, 0.04)',
                                                            border: '2px dashed rgba(74, 111, 165, 0.15)',
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: '0.8rem',
                                                            minHeight: '40px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Plus size={14} />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{
                                marginTop: '20px',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            }}>
                                <Button variant="outline">取消</Button>
                                <Button variant="primary" icon={<Save size={16} />}>
                                    儲存課表
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            padding: '60px',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                            background: 'rgba(74, 111, 165, 0.04)',
                            borderRadius: 'var(--radius-md)',
                            border: '2px dashed rgba(74, 111, 165, 0.15)'
                        }}>
                            <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p style={{ margin: 0, fontSize: '1rem' }}>請從左側選擇一位教師</p>
                            <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>即可查看與編輯其課表</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* RWD 樣式 */}
            <style>{`
                @media (max-width: 900px) {
                    div[style*="grid-template-columns: 280px"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default HourlyTeachersSchedule;
