import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { Upload, X, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { addTeacher } from '../services/firestore';

const BatchImportModal = ({ onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('請上傳 CSV 檔案');
                return;
            }
            setFile(selectedFile);
            setError('');
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            // Simple parsing, assuming header is first line

            const data = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',').map(v => v.trim());
                const entry = {};

                // Simple mapping based on expected headers or index
                // Assuming CSV format: Name, Role, Subject, Phone, Email
                entry.name = values[0] || '';
                entry.role = values[1] || '專任教師';
                entry.subject = values[2] || '';
                entry.phone = values[3] || '';
                entry.email = values[4] || '';

                if (entry.name) data.push(entry);
            }
            setPreviewData(data);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setLoading(true);
        setLogs([]);
        let successCount = 0;
        let failCount = 0;

        for (const teacher of previewData) {
            try {
                await addTeacher(teacher);
                setLogs(prev => [...prev, { status: 'success', msg: `成功新增: ${teacher.name}` }]);
                successCount++;
            } catch (err) {
                setLogs(prev => [...prev, { status: 'error', msg: `失敗 (${teacher.name}): ${err.message}` }]);
                failCount++;
            }
        }

        setLoading(false);
        if (successCount > 0) {
            setTimeout(() => {
                onImportSuccess();
                onClose();
            }, 1500);
        }
    };

    const downloadTemplate = () => {
        const headers = "姓名,職務,科目,電話,Email";
        const example = "王大明,專任教師,國文,0912345678,wang@school.edu.tw";
        const csvContent = "data:text/csv;charset=utf-8," + "\uFEFF" + headers + "\n" + example;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "教師匯入範本.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            <Card style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-text)' }}>批次新增教師</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="var(--color-text)" />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '4px' }}>

                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outline" size="small" onClick={downloadTemplate}>
                            <Download size={16} />
                            下載 CSV 範本
                        </Button>
                    </div>

                    {!file ? (
                        <div style={{
                            border: '3px dashed var(--color-macaron-blue)',
                            borderRadius: '16px',
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#f9f9f9',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                            onClick={() => document.getElementById('csvInput').click()}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                        >
                            <Upload size={48} color="var(--color-macaron-blue)" style={{ marginBottom: '16px' }} />
                            <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text)' }}>點擊上傳 CSV 檔案</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#888' }}>格式：姓名, 職務, 科目, 電話, Email</p>
                            <input
                                id="csvInput"
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '12px' }}>
                                <FileText size={24} color="var(--color-macaron-blue)" />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{file.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{previewData.length} 筆資料</p>
                                </div>
                                <button onClick={() => { setFile(null); setPreviewData([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {previewData.length > 0 && (
                                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '12px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>姓名</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>職務</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>科目</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((row, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '8px' }}>{row.name}</td>
                                                    <td style={{ padding: '8px' }}>{row.role}</td>
                                                    <td style={{ padding: '8px' }}>{row.subject}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {logs.length > 0 && (
                                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '12px', maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem' }}>
                                    {logs.map((log, i) => (
                                        <div key={i} style={{ color: log.status === 'success' ? 'green' : 'red', marginBottom: '4px' }}>
                                            {log.status === 'success' ? '✓' : '✗'} {log.msg}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="outline" onClick={onClose} disabled={loading}>取消</Button>
                    <Button
                        variant="primary"
                        onClick={handleImport}
                        disabled={!file || loading || previewData.length === 0}
                    >
                        {loading ? '匯入中...' : '開始匯入'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default BatchImportModal;
