import React, { useState } from 'react';

/**
 * Button 元件 - 根據 frontend-design SKILL 設計
 * 特色：大膽漸層、懸停光暈、專業色彩系統
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    className = '',
    style = {},
    loading = false,
    icon,
    iconPosition = 'left',
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const baseStyles = {
        border: 'none',
        borderRadius: 'var(--radius-btn)',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-display)',
        fontWeight: '600',
        letterSpacing: '0.01em',
        transition: 'all var(--transition-bounce)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        position: 'relative',
        overflow: 'hidden',
        opacity: props.disabled ? 0.6 : 1,
    };

    const variants = {
        primary: {
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            color: 'white',
            boxShadow: isHovered && !props.disabled
                ? '0 12px 28px rgba(74, 111, 165, 0.35)'
                : '0 4px 14px rgba(74, 111, 165, 0.25)',
        },
        accent: {
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #D35D47 100%)',
            color: 'white',
            boxShadow: isHovered && !props.disabled
                ? '0 12px 28px rgba(231, 111, 81, 0.4)'
                : '0 4px 14px rgba(231, 111, 81, 0.3)',
        },
        secondary: {
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)',
            color: 'white',
            boxShadow: isHovered && !props.disabled
                ? '0 12px 28px rgba(126, 200, 227, 0.35)'
                : '0 4px 14px rgba(126, 200, 227, 0.25)',
        },
        success: {
            background: 'linear-gradient(135deg, var(--color-success) 0%, #3A6247 100%)',
            color: 'white',
            boxShadow: isHovered && !props.disabled
                ? '0 12px 28px rgba(74, 124, 89, 0.35)'
                : '0 4px 14px rgba(74, 124, 89, 0.25)',
        },
        warning: {
            background: 'linear-gradient(135deg, var(--color-warning) 0%, #E09010 100%)',
            color: '#1A2B3C',
            boxShadow: isHovered && !props.disabled
                ? '0 12px 28px rgba(249, 166, 32, 0.35)'
                : '0 4px 14px rgba(249, 166, 32, 0.25)',
        },
        danger: {
            background: 'linear-gradient(135deg, var(--color-danger) 0%, #8C3520 100%)',
            color: 'white',
            boxShadow: isHovered && !props.disabled
                ? '0 12px 28px rgba(183, 71, 42, 0.35)'
                : '0 4px 14px rgba(183, 71, 42, 0.25)',
        },
        outline: {
            background: 'transparent',
            border: '2px solid var(--color-primary)',
            color: 'var(--color-primary)',
            boxShadow: 'none',
        },
        ghost: {
            background: isHovered ? 'rgba(74, 111, 165, 0.08)' : 'transparent',
            color: 'var(--color-primary)',
            boxShadow: 'none',
        }
    };

    const sizes = {
        small: {
            padding: '10px 20px',
            fontSize: '0.875rem',
            minHeight: '36px',
        },
        medium: {
            padding: '12px 28px',
            fontSize: '0.95rem',
            minHeight: '44px',
        },
        large: {
            padding: '16px 36px',
            fontSize: '1.05rem',
            minHeight: '52px',
        }
    };

    const getTransform = () => {
        if (props.disabled) return 'none';
        if (isPressed) return 'scale(0.96)';
        if (isHovered) return 'translateY(-3px) scale(1.02)';
        return 'translateY(0) scale(1)';
    };

    const combinedStyle = {
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        transform: getTransform(),
        ...style,
    };

    return (
        <button
            style={combinedStyle}
            className={className}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            {...props}
        >
            {loading ? (
                <span style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }}></span>
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    {children}
                    {icon && iconPosition === 'right' && icon}
                </>
            )}

            {/* Loading spinner keyframes */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
};

export default Button;
