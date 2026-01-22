import React from 'react';
import './Components.css';

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`ui-input-wrapper ${className}`}>
            {label && <label className="ui-label">{label}</label>}
            <input
                type={type}
                className="ui-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                {...props}
            />
        </div>
    );
};

export default Input;
