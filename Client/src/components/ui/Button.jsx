import React from 'react';
import './Components.css';

const Button = ({
    children,
    variant = 'primary', // primary, secondary, danger, ghost
    onClick,
    type = 'button',
    className = '',
    disabled = false,
    ...props
}) => {
    return (
        <button
            type={type}
            className={`ui-button ui-button--${variant} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
