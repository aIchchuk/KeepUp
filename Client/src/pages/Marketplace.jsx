import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Button from '../components/ui/Button';
import '../styles/Marketplace.css';

const Marketplace = () => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchaseStatus, setPurchaseStatus] = useState({ id: null, type: '', message: '' });
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', price: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const filteredTemplates = templates.filter(template =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/templates');
            setTemplates(res.data);
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyTemplate = async (templateId) => {
        setPurchaseStatus({ id: templateId, type: 'loading', message: 'Redirecting to Khalti...' });
        try {
            const res = await api.post('/payment/khalti/initiate', { templateId });

            if (res.data.payment_url) {
                // Redirect user to Khalti Payment Portal
                window.location.href = res.data.payment_url;
            } else {
                throw new Error("Payment URL not provided");
            }
        } catch (err) {
            setPurchaseStatus({
                id: templateId,
                type: 'error',
                message: err.response?.data?.message || 'Payment initiation failed'
            });
            setTimeout(() => setPurchaseStatus({ id: null, type: '', message: '' }), 5000);
        }
    };

    const handleEditClick = (template) => {
        setEditingTemplate(template._id);
        setEditForm({
            title: template.title,
            description: template.description,
            price: template.price
        });
    };

    const handleUpdateTemplate = async (templateId) => {
        try {
            const res = await api.put(`/templates/${templateId}`, editForm);
            setTemplates(templates.map(t => t._id === templateId ? res.data : t));
            setEditingTemplate(null);
            setPurchaseStatus({ id: templateId, type: 'success', message: 'Template updated successfully!' });
        } catch (err) {
            setPurchaseStatus({ id: templateId, type: 'error', message: err.response?.data?.message || 'Update failed' });
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/templates/${templateId}`);
            setTemplates(templates.filter(t => t._id !== templateId));
            setPurchaseStatus({ id: templateId, type: 'success', message: 'Template deleted successfully!' });
            setTimeout(() => setPurchaseStatus({ id: null, type: '', message: '' }), 3000);
        } catch (err) {
            setPurchaseStatus({ id: templateId, type: 'error', message: err.response?.data?.message || 'Delete failed' });
        }
    };

    const isOwner = (template) => {
        return user && template.author && (template.author._id === user._id || template.author === user._id);
    };

    return (
        <div className="marketplace-container">
            <div className="marketplace-header">
                <div className="header-text">
                    <h1>Template Marketplace</h1>
                    <p>
                        Discover high-quality templates created by experts.
                    </p>
                </div>
                <div className={`search-wrapper ${isSearchVisible ? 'active' : ''}`}>
                    <button
                        className="search-toggle-btn"
                        onClick={() => setIsSearchVisible(!isSearchVisible)}
                        aria-label="Toggle search"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                            autoFocus={isSearchVisible}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="templates-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="template-card skeleton" style={{ height: '400px' }}></div>
                    ))}
                </div>
            ) : (
                <div className="templates-grid">
                    {filteredTemplates.map(template => (
                        <div key={template._id} className="template-card">
                            <div className="template-preview">
                                {template.structure?.projectSettings?.coverImage ? (
                                    <img
                                        src={template.structure.projectSettings.coverImage}
                                        alt={template.title}
                                        className="template-cover-img"
                                    />
                                ) : (
                                    <div className="template-icon">💎</div>
                                )}
                                <div className="template-price">
                                    ${template.price || 0}
                                </div>
                                {isOwner(template) && (
                                    <div className="owner-badge">Your Template</div>
                                )}
                            </div>
                            <div className="template-content">
                                {editingTemplate === template._id ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            placeholder="Template Title"
                                            className="edit-input"
                                        />
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            placeholder="Description"
                                            className="edit-textarea"
                                            rows="3"
                                        />
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            placeholder="Price"
                                            className="edit-input"
                                            min="0"
                                            step="0.01"
                                        />
                                        <div className="edit-actions">
                                            <Button
                                                variant="primary"
                                                onClick={() => handleUpdateTemplate(template._id)}
                                                style={{ flex: 1 }}
                                            >
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setEditingTemplate(null)}
                                                style={{ flex: 1 }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="template-title">{template.title}</h3>
                                        <p className="template-desc">
                                            {template.description}
                                        </p>

                                        <div className="template-meta">
                                            <div className="author-dot"></div>
                                            <span>By {template.author?.name || 'KeepUp Expert'}</span>
                                        </div>

                                        {purchaseStatus.id === template._id && purchaseStatus.type ? (
                                            <div className={`purchase-status ${purchaseStatus.type}`}>
                                                {purchaseStatus.message}
                                            </div>
                                        ) : isOwner(template) ? (
                                            <div className="owner-actions">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleEditClick(template)}
                                                    style={{ flex: 1 }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteTemplate(template._id)}
                                                    style={{ flex: 1 }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                onClick={() => handleBuyTemplate(template._id)}
                                                style={{ width: '100%' }}
                                            >
                                                Purchase Template
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
