import React from 'react';

const Input = ({ label, error, ...props }) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '16px',
        textAlign: 'left',
    };

    const labelStyle = {
        fontSize: '0.9rem',
        color: '#666',
        fontWeight: '500',
        marginLeft: '4px',
    };

    const inputStyle = {
        padding: '12px 16px',
        borderRadius: '12px',
        border: '2px solid #eee',
        fontSize: '1rem',
        fontFamily: 'var(--font-main)',
        transition: 'border-color 0.2s ease',
        outline: 'none',
        backgroundColor: '#fff',
    };

    const errorStyle = {
        color: 'var(--color-macaron-pink)',
        fontSize: '0.85rem',
        marginLeft: '4px',
    };

    return (
        <div style={containerStyle}>
            {label && <label style={labelStyle}>{label}</label>}
            <input
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-macaron-blue)'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
                {...props}
            />
            {error && <span style={errorStyle}>{error}</span>}
        </div>
    );
};

export default Input;
