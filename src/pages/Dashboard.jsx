import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import {
    Users, Calendar, Clock, AlertCircle, ArrowRight,
    FileText, TrendingUp, Sparkles, BookOpen, Award
} from 'lucide-react';
import { getDashboardStats } from '../services/stats';

/**
 * 統計卡片元件 - 根據 frontend-design SKILL 設計
 */
const StatCard = ({ title, value, icon: Icon, color, loading, delay = 0, trend }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            animationDelay={delay}
            disableHover
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* 背景裝飾 */}
            <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                pointerEvents: 'none'
            }}></div>

            {/* 圖示 */}
            <div
                style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: `linear-gradient(145deg, ${color} 0%, ${color}CC 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: `0 8px 24px ${color}40`,
                    transform: isHovered ? 'rotate(-8deg) scale(1.05)' : 'rotate(-5deg)',
                    transition: 'all var(--transition-bounce)',
                    flexShrink: 0
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Icon size={30} strokeWidth={2} />
            </div>

            {/* 數據 */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <p style={{
                    margin: 0,
                    color: 'var(--color-text-light)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-display)'
                }}>
                    {title}
                </p>
                {loading ? (
                    <div className="skeleton" style={{ height: '40px', width: '90px', marginTop: '10px' }}></div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <h3 style={{
                            margin: '8px 0 0 0',
                            fontSize: '2.5rem',
                            color: 'var(--color-text)',
                            fontWeight: '800',
                            lineHeight: 1,
                            fontFamily: 'var(--font-display)'
                        }}>
                            {value}
                        </h3>
                        {trend && (
                            <span style={{
                                fontSize: '0.8rem',
                                color: trend > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                            }}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

/**
 * 快速操作按鈕 - 根據 frontend-design SKILL 設計
 */
const QuickAction = ({ icon: Icon, label, color, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '24px 20px',
                backgroundColor: isHovered ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                border: `2px solid ${isHovered ? color + '30' : 'transparent'}`,
                borderRadius: 'var(--radius-card)',
                cursor: 'pointer',
                transition: 'all var(--transition-bounce)',
                flex: 1,
                minWidth: '130px',
                transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: isHovered ? `0 16px 32px ${color}25` : 'var(--shadow-sm)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: `linear-gradient(145deg, ${color} 0%, ${color}DD 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 6px 16px ${color}40`,
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                transition: 'all var(--transition-bounce)'
            }}>
                <Icon size={26} strokeWidth={2} />
            </div>
            <span style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-display)'
            }}>
                {label}
            </span>
        </button>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalTeachers: 0,
        fullTimeTeachers: 0,
        currentMonthSubstitutes: 0,
        pendingApplications: 0
    });
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const [greetingEmoji, setGreetingEmoji] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('早安');
            setGreetingEmoji('☀️');
        } else if (hour < 18) {
            setGreeting('午安');
            setGreetingEmoji('🌤️');
        } else {
            setGreeting('晚安');
            setGreetingEmoji('🌙');
        }

        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            {/* 歡迎區塊 */}
            <header style={{ marginBottom: '40px', animation: 'fadeInUp 0.6s var(--ease-out-expo)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <span style={{
                        fontSize: '2.5rem',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        {greetingEmoji}
                    </span>
                    <h1 style={{
                        fontSize: '2.6rem',
                        margin: 0,
                        fontWeight: '800',
                        fontFamily: 'var(--font-display)',
                        background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 50%, var(--color-accent) 100%)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'gradientFlow 4s ease infinite'
                    }}>
                        {greeting}！
                    </h1>
                </div>
                <p style={{
                    color: 'var(--color-text-light)',
                    fontSize: '1.1rem',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Sparkles size={20} color="var(--color-warning)" />
                    歡迎回到代課代理管理系統，今天也要加油喔！
                </p>
            </header>

            {/* 統計卡片 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <StatCard
                    title="總教師數"
                    value={stats.totalTeachers}
                    icon={Users}
                    color="var(--color-primary)"
                    loading={loading}
                    delay={0}
                />
                <StatCard
                    title="專任教師"
                    value={stats.fullTimeTeachers}
                    icon={BookOpen}
                    color="var(--color-info)"
                    loading={loading}
                    delay={80}
                />
                <StatCard
                    title="本月代課"
                    value={stats.currentMonthSubstitutes}
                    icon={Calendar}
                    color="var(--color-success)"
                    loading={loading}
                    delay={160}
                />
                <StatCard
                    title="待處理申請"
                    value={stats.pendingApplications}
                    icon={Clock}
                    color="var(--color-warning)"
                    loading={loading}
                    delay={240}
                />
            </div>

            {/* 快速操作 */}
            <Card
                title="快速操作"
                titleIcon={<Sparkles size={20} />}
                animationDelay={320}
                variant="accent"
                style={{ marginBottom: '28px' }}
            >
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                    <QuickAction
                        icon={FileText}
                        label="公假代課"
                        color="var(--color-primary)"
                        onClick={() => navigate('/official-sub')}
                    />
                    <QuickAction
                        icon={Calendar}
                        label="事病假代課"
                        color="var(--color-accent)"
                        onClick={() => navigate('/personal-sub')}
                    />
                    <QuickAction
                        icon={Users}
                        label="教師管理"
                        color="var(--color-info)"
                        onClick={() => navigate('/hourly-teachers')}
                    />
                    <QuickAction
                        icon={TrendingUp}
                        label="統計報表"
                        color="var(--color-success)"
                        onClick={() => navigate('/stats/sub')}
                    />
                </div>
            </Card>

            {/* 底部資訊區 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                <Card
                    title="近期代課紀錄"
                    titleIcon={<Calendar size={20} />}
                    animationDelay={400}
                    variant="info"
                >
                    <div style={{
                        padding: '36px',
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                        background: 'linear-gradient(135deg, rgba(74, 111, 165, 0.05) 0%, rgba(126, 200, 227, 0.08) 100%)',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed rgba(74, 111, 165, 0.2)'
                    }}>
                        <Calendar size={40} color="var(--color-primary)" style={{ marginBottom: '16px', opacity: 0.4 }} />
                        <p style={{ margin: '0 0 16px', fontSize: '0.95rem' }}>開始新增請假單後，紀錄會顯示在這裡</p>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => navigate('/official-sub')}
                            icon={<ArrowRight size={16} />}
                            iconPosition="right"
                        >
                            前往新增
                        </Button>
                    </div>
                </Card>

                <Card
                    title="系統公告"
                    titleIcon={<AlertCircle size={20} />}
                    animationDelay={480}
                    variant="warning"
                >
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(74, 111, 165, 0.1)'
                    }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div style={{
                                minWidth: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                background: 'linear-gradient(145deg, var(--color-accent), var(--color-accent-light))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 6px 16px rgba(231, 111, 81, 0.35)'
                            }}>
                                <Award size={24} />
                            </div>
                            <div>
                                <h4 style={{
                                    margin: '0 0 8px 0',
                                    color: 'var(--color-text)',
                                    fontSize: '1.05rem',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: '700'
                                }}>
                                    🎉 系統全新上線！
                                </h4>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-light)',
                                    lineHeight: 1.7
                                }}>
                                    全新的代課代理管理系統正式上線！介面煥然一新，操作更加直覺。如有任何問題歡迎回報。
                                </p>
                                <p style={{
                                    margin: '12px 0 0',
                                    fontSize: '0.8rem',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    2026/01/28
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
