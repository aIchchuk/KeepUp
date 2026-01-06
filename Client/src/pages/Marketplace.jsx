import React, { useState, useEffect } from 'react';
import api from '../api/api';

const Marketplace = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchaseStatus, setPurchaseStatus] = useState({ id: null, type: '', message: '' });

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
        setPurchaseStatus({ id: templateId, type: 'loading', message: 'Processing purchase...' });
        try {
            const res = await api.post('/templates/buy', { templateId });
            setPurchaseStatus({ id: templateId, type: 'success', message: res.data.message });
            // In a real app, we'd navigate to Stripe or the new project
        } catch (err) {
            setPurchaseStatus({ id: templateId, type: 'error', message: err.response?.data?.message || 'Purchase failed' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Template Marketplace</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Skip the setup and get straight to work. Discover high-quality templates created by experts.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-100 rounded-[32px] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {templates.map(template => (
                            <div key={template._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group">
                                <div className="h-40 bg-gradient-to-br from-indigo-500 to-violet-600 p-8 relative flex items-center justify-center">
                                    <div className="text-5xl group-hover:scale-125 transition-transform duration-500">💎</div>
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
                                        ${template.price || 0}
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                                        {template.description}
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                            <div className="w-5 h-5 rounded-full bg-gray-100"></div>
                                            By {template.author?.name || 'KeepUp Expert'}
                                        </div>

                                        {purchaseStatus.id === template._id && purchaseStatus.type ? (
                                            <div className={`p-4 rounded-2xl text-sm font-bold text-center ${purchaseStatus.type === 'success' ? 'bg-green-50 text-green-600' :
                                                    purchaseStatus.type === 'error' ? 'bg-red-50 text-red-600' :
                                                        'bg-indigo-50 text-indigo-600 animate-pulse'
                                                }`}>
                                                {purchaseStatus.message}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleBuyTemplate(template._id)}
                                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
                                            >
                                                Purchase Template
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
