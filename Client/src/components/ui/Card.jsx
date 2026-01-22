import React from 'react';
import './Components.css';

const Card = ({ children, className = '', onClick }) => {
    return (
        <div className={`ui-card ${className}`} onClick={onClick}>
            {children}
        </div>
    );
};

export default Card;
