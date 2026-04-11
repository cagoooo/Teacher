import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, Calendar, LogOut, UserPlus, FileText, Clock, BarChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // New menu structure based on user request
    const menuGroups = [
        {
            title: '主選單',
            items: [
                { icon: Home, label: '首頁', path: '/' },
            ]
        },
        {
            title: '教師資料管理',
            items: [
                { icon: Users, label: '所有教師列表', path: '/teachers' },
            ]
        },
        {
            title: '公假派代',
            items: [
                { icon: FileText, label: '公假代課', path: '/official-sub' },
                { icon: Users, label: '公假代理', path: '/official-proxy' },
            ]
        },
        {
            title: '事病假派代',
            items: [
                { icon: FileText, label: '事病假代課', path: '/personal-sub' },
                { icon: Users, label: '事病假代理', path: '/personal-proxy' },
            ]
        },
        {
            title: '鐘點教師管理',
            items: [
                { icon: Clock, label: '超鐘點教師', path: '/overtime-teachers' },
                { icon: Users, label: '鐘點教師排課', path: '/hourly-teachers-schedule' },
            ]
        },
        {
            title: '統計報表',
            items: [
                { icon: BarChart, label: '請假者統計', path: '/stats/leave' },
                { icon: BarChart, label: '代課者統計', path: '/stats/sub' },
            ]
        }
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        zIndex: 98,
                        backdropFilter: 'blur(4px)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* Mobile Header */}
            <div className="mobile-header" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '64px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                boxShadow: '0 2px 16px rgba(197, 179, 230, 0.2)',
                zIndex: 100,
                borderBottom: '1px solid rgba(197, 179, 230, 0.2)'
            }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                        border: 'none',
                        cursor: 'pointer',
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(74, 111, 165, 0.35)'
                    }}
                >
                    {isSidebarOpen ? <X size={22} color="white" /> : <Menu size={22} color="white" />}
                </button>
                <h1 style={{
                    fontSize: '1.15rem',
                    background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: '0 0 0 14px',
                    fontWeight: '700',
                    fontFamily: 'var(--font-display)'
                }}>
                    代課代理系統
                </h1>
            </div>

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{
                width: '260px',
                backgroundColor: 'var(--glass-bg)',
                backdropFilter: 'var(--backdrop-blur)',
                borderRight: 'var(--glass-border)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                zIndex: 99,
                boxShadow: 'var(--glass-shadow)',
                overflow: 'hidden', // Prevent double scrollbars, let nav handle scroll if needed
                boxSizing: 'border-box'
            }}>
                <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        background: 'linear-gradient(145deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(74, 111, 165, 0.3)'
                    }}>
                        <Calendar size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.35rem', color: 'var(--color-text)', margin: 0, fontWeight: '800', fontFamily: 'var(--font-display)' }}>管理系統</h1>
                </div>

                <div style={{ marginBottom: '24px', padding: '14px', background: 'linear-gradient(135deg, rgba(74, 111, 165, 0.08) 0%, rgba(126, 200, 227, 0.08) 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(145deg, var(--color-info) 0%, var(--color-primary) 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(74, 111, 165, 0.25)' }}>
                        {currentUser?.email?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>目前登入</p>
                        <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser?.email}
                        </p>
                    </div>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', margin: '0 -12px', padding: '0 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px' }}>
                        {menuGroups.map((group, groupIndex) => {
                            const groupColors = [
                                'var(--color-macaron-purple)',
                                'var(--color-macaron-blue)',
                                'var(--color-macaron-purple)',
                                'var(--color-macaron-pink)',
                                'var(--color-macaron-green)',
                                'var(--color-macaron-orange)'
                            ];
                            const groupColor = groupColors[groupIndex % groupColors.length];

                            return (
                                <div key={groupIndex} style={{ animation: `fadeInUp 0.4s ease-out ${groupIndex * 50}ms both` }}>
                                    <h4 style={{
                                        margin: '0 0 10px 12px',
                                        fontSize: '0.7rem',
                                        color: groupColor,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.5px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            width: '16px',
                                            height: '2px',
                                            backgroundColor: groupColor,
                                            borderRadius: '1px'
                                        }}></span>
                                        {group.title}
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {group.items.map((item) => {
                                            const active = isActive(item.path);
                                            return (
                                                <li key={item.path}>
                                                    <button
                                                        onClick={() => {
                                                            navigate(item.path);
                                                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            padding: '11px 16px',
                                                            border: 'none',
                                                            borderRadius: '14px',
                                                            background: active
                                                                ? `linear-gradient(135deg, ${groupColor} 0%, ${groupColor}DD 100%)`
                                                                : 'transparent',
                                                            color: active ? 'white' : 'var(--color-text)',
                                                            cursor: 'pointer',
                                                            fontSize: '0.95rem',
                                                            fontWeight: active ? '600' : '500',
                                                            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                            textAlign: 'left',
                                                            boxShadow: active ? `0 4px 12px ${groupColor}40` : 'none',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!active) {
                                                                e.currentTarget.style.backgroundColor = `${groupColor}15`;
                                                                e.currentTarget.style.transform = 'translateX(4px)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!active) {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.transform = 'translateX(0)';
                                                            }
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '8px',
                                                            backgroundColor: active ? 'rgba(255,255,255,0.25)' : `${groupColor}20`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s ease'
                                                        }}>
                                                            <item.icon size={16} color={active ? 'white' : groupColor} />
                                                        </div>
                                                        {item.label}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </nav>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: 'auto', flexShrink: 0 }}>
                    <Button variant="outline" size="small" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
                        <LogOut size={16} />
                        登出系統
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content" style={{
                flex: 1,
                padding: '24px',
                backgroundColor: 'var(--color-bg)',
                minHeight: '100vh',
                boxSizing: 'border-box'
            }}>
                <Outlet />
            </main>

            {/* CSS for responsive behavior */}
            <style>{`
                .sidebar {
                    transform: translateX(-100%);
                    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .sidebar.open {
                    transform: translateX(0);
                }
                .main-content {
                    margin-top: 64px;
                    padding: 20px;
                    transition: padding 0.3s ease;
                }
                .mobile-header {
                    display: flex;
                }
                .mobile-overlay {
                    display: block;
                }

                @media (min-width: 769px) {
                    .mobile-header { display: none !important; }
                    .mobile-overlay { display: none !important; }
                    .sidebar { 
                        transform: translateX(0) !important; 
                        position: sticky !important;
                        top: 0;
                        height: 100vh;
                    }
                    .main-content { 
                        margin-top: 0 !important; 
                        padding: 32px;
                    }
                }

                @media (max-width: 768px) {
                    .main-content {
                        padding: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .main-content {
                        padding: 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Layout;
