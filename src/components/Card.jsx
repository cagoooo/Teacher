import React, { useState } from 'react';

/**
 * Card 元件 - 根據 frontend-design SKILL 設計
 * 特色：漸層邊框、標題裝飾線、彈性 hover 效果
 */
const Card = ({
    children,
    className = '',
    title,
    titleIcon,
    style = {},
    animationDelay = 0,
    disableHover = false,
    variant = 'default', // default, accent, success, warning
    onClick,
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // 根據 variant 決定裝飾色
    const getAccentColor = () => {
        switch (variant) {
            case 'accent': return 'var(--color-accent)';
            case 'success': return 'var(--color-success)';
            case 'warning': return 'var(--color-warning)';
            case 'info': return 'var(--color-info)';
            default: return 'var(--color-primary)';
        }
    };

    const cardStyle = {
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        padding: '28px',
        boxShadow: isHovered && !disableHover ? 'var(--shadow-hover)' : 'var(--shadow-soft)',
        border: '1px solid rgba(74, 111, 165, 0.08)',
        transition: 'all var(--transition-bounce)',
        backdropFilter: 'blur(16px)',
        transform: isHovered && !disableHover ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        cursor: onClick ? 'pointer' : 'default',
        animation: `fadeInUp 0.6s var(--ease-out-expo) ${animationDelay}ms both`,
        position: 'relative',
        overflow: 'hidden',
        ...style
    };

    // 頂部漸層裝飾線
    const topBorderStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${getAccentColor()} 0%, var(--color-accent-light) 50%, ${getAccentColor()} 100%)`,
        backgroundSize: '200% 100%',
        animation: isHovered ? 'gradientFlow 2s ease infinite' : 'none',
        borderRadius: 'var(--radius-card) var(--radius-card) 0 0'
    };

    return (
        <div
            style={cardStyle}
            className={`${className} card-hover`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            {/* 頂部漸層裝飾線 */}
            <div style={topBorderStyle}></div>

            {title && (
                <h3 style={{
                    marginTop: '4px',
                    marginBottom: '20px',
                    color: 'var(--color-text)',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    fontFamily: 'var(--font-display)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    letterSpacing: '-0.01em'
                }}>
                    {titleIcon && (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${getAccentColor()}20 0%, ${getAccentColor()}10 100%)`,
                            color: getAccentColor()
                        }}>
                            {titleIcon}
                        </span>
                    )}
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};

export default Card;
