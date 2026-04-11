import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import BatchImportModal from '../components/BatchImportModal';
import EditTeacherModal from '../components/EditTeacherModal';
import { getTeachers, deleteTeacher } from '../services/firestore';
import { UserPlus, Search, MoreVertical, Phone, Mail, BookOpen, Upload, Edit2, Trash2 } from 'lucide-react';

const TeacherList = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [deletingTeacher, setDeletingTeacher] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRef = useRef(null);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const data = await getTeachers();
            setTeachers(data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    // 點擊外部關閉下拉選單
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role) {
            case '專任教師': return 'var(--color-macaron-blue)';
            case '代理教師': return 'var(--color-macaron-purple)';
            case '代課教師': return 'var(--color-macaron-yellow)';
            case '兼任教師': return 'var(--color-macaron-green)';
            case '行政人員': return 'var(--color-macaron-orange)';
            default: return '#ccc';
        }
    };

    const handleDelete = async () => {
        if (!deletingTeacher) return;
        setDeleteLoading(true);
        try {
            await deleteTeacher(deletingTeacher.id);
            setDeletingTeacher(null);
            fetchTeachers();
        } catch (error) {
            alert('刪除失敗：' + error.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-text)', fontWeight: '800' }}>教師列表</h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--color-text-light)' }}>管理學校所有教師資料</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="secondary" onClick={() => setShowImportModal(true)}>
                        <Upload size={20} />
                        批次匯入
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/teachers/new')}>
                        <UserPlus size={20} />
                        新增教師
                    </Button>
                </div>
            </div>

            <Card style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Search size={20} color="#888" />
                    <input
                        type="text"
                        placeholder="搜尋教師姓名或科目..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            width: '100%',
                            fontFamily: 'var(--font-main)',
                            backgroundColor: 'transparent'
                        }}
                    />
                </div>
            </Card>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>載入中...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {filteredTeachers.map(teacher => (
                        <Card key={teacher.id} style={{ position: 'relative', overflow: 'visible' }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '6px',
                                height: '100%',
                                backgroundColor: getRoleColor(teacher.role),
                                borderRadius: '24px 0 0 24px'
                            }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: `${getRoleColor(teacher.role)}30`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: 'var(--color-text)'
                                    }}>
                                        {teacher.name[0]}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text)' }}>{teacher.name}</h3>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            backgroundColor: `${getRoleColor(teacher.role)}20`,
                                            color: getRoleColor(teacher.role),
                                            fontSize: '0.8rem',
                                            marginTop: '4px',
                                            fontWeight: '600'
                                        }}>
                                            {teacher.role}
                                        </span>
                                    </div>
                                </div>

                                {/* 下拉選單按鈕 */}
                                <div style={{ position: 'relative' }} ref={activeDropdown === teacher.id ? dropdownRef : null}>
                                    <button
                                        onClick={() => setActiveDropdown(activeDropdown === teacher.id ? null : teacher.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#aaa',
                                            padding: '4px',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {/* 下拉選單 */}
                                    {activeDropdown === teacher.id && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                            minWidth: '140px',
                                            zIndex: 100,
                                            overflow: 'hidden',
                                            animation: 'fadeIn 0.15s ease'
                                        }}>
                                            <button
                                                onClick={() => {
                                                    setEditingTeacher(teacher);
                                                    setActiveDropdown(null);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    color: 'var(--color-text)',
                                                    fontSize: '0.95rem',
                                                    fontFamily: 'var(--font-main)',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                <Edit2 size={16} />
                                                編輯
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeletingTeacher(teacher);
                                                    setActiveDropdown(null);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    color: '#e53935',
                                                    fontSize: '0.95rem',
                                                    fontFamily: 'var(--font-main)',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                <Trash2 size={16} />
                                                刪除
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {teacher.subject && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                        <BookOpen size={16} />
                                        <span>{teacher.subject}</span>
                                    </div>
                                )}
                                {teacher.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                        <Phone size={16} />
                                        <span>{teacher.phone}</span>
                                    </div>
                                )}
                                {teacher.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                        <Mail size={16} />
                                        <span>{teacher.email}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && filteredTeachers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                    <p>找不到符合條件的教師</p>
                    <Button variant="outline" onClick={() => navigate('/teachers/new')}>立即新增</Button>
                </div>
            )}

            {/* 批次匯入 Modal */}
            {showImportModal && (
                <BatchImportModal
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={() => {
                        fetchTeachers();
                    }}
                />
            )}

            {/* 編輯教師 Modal */}
            {editingTeacher && (
                <EditTeacherModal
                    teacher={editingTeacher}
                    onClose={() => setEditingTeacher(null)}
                    onSuccess={() => fetchTeachers()}
                />
            )}

            {/* 刪除確認對話框 */}
            {deletingTeacher && (
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
                    <Card style={{ width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: '#ffebee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <Trash2 size={28} color="#e53935" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text)' }}>確認刪除</h3>
                        <p style={{ margin: '0 0 24px 0', color: '#666' }}>
                            確定要刪除教師「<strong>{deletingTeacher.name}</strong>」嗎？<br />
                            此動作無法復原。
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <Button variant="outline" onClick={() => setDeletingTeacher(null)} disabled={deleteLoading}>
                                取消
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                style={{ backgroundColor: '#e53935' }}
                            >
                                {deleteLoading ? '刪除中...' : '確認刪除'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* 動畫樣式 */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default TeacherList;
