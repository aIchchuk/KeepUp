import React, { useEffect } from 'react';
import './Components.css';

const Modal = ({ isOpen, onClose, title, description, children }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="ui-modal-overlay" onClick={onClose}>
            <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
                <button className="ui-modal-close" onClick={onClose}>
                    &times;
                </button>
                <div className="ui-modal-header">
                    {title && <h2 className="ui-modal-title">{title}</h2>}
                    {description && <p className="ui-modal-desc">{description}</p>}
                </div>
                <div className="ui-modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
