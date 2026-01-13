import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [modalType, setModalType] = useState('task'); // 'task', 'list', 'page'
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        content: '',
        parentId: null
    });
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState({ type: '', message: '' });
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    useEffect(() => {
        const handleClickAway = () => setShowCreateDropdown(false);
        if (showCreateDropdown) {
            window.addEventListener('click', handleClickAway);
        }
        return () => window.removeEventListener('click', handleClickAway);
    }, [showCreateDropdown]);

    const fetchProjectData = async () => {
        try {
            const [projRes, itemsRes] = await Promise.all([
                api.get(`/projects`),
                api.get(`/projects/${id}/tasks`)
            ]);

            const foundProject = projRes.data.find(p => p._id === id);
            setProject(foundProject);
            setItems(itemsRes.data);
        } catch (err) {
            console.error('Error fetching project data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        setInviteStatus({ type: 'loading', message: 'Sending invite...' });
        try {
            await api.post(`/projects/${id}/invite`, { email: inviteEmail });
            setInviteStatus({ type: 'success', message: 'Member invited successfully!' });
            setInviteEmail('');
            setTimeout(() => {
                setShowInviteModal(false);
                setInviteStatus({ type: '', message: '' });
                fetchProjectData();
            }, 1500);
        } catch (err) {
            setInviteStatus({ type: 'error', message: err.response?.data?.message || 'Failed to invite member' });
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/projects/${id}/tasks`, { ...newItem, type: modalType });
            setNewItem({
                title: '',
                description: '',
                priority: 'medium',
                status: 'todo',
                content: '',
                parentId: null
            });
            setShowModal(false);
            fetchProjectData();
        } catch (err) {
            console.error('Error creating item:', err);
        }
    };

    const openModal = (type, parentId = null) => {
        setModalType(type);
        setNewItem(prev => ({ ...prev, parentId }));
        setShowModal(true);
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold text-xl">Loading project...</div>;
    if (!project) return <div className="p-20 text-center">Project not found. <Link to="/dashboard" className="text-indigo-600 underline">Back to Dashboard</Link></div>;

    const rootItems = items.filter(item => !item.parentId);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Breadcrumbs & Header */}
                <div className="space-y-4">
                    <Link to="/dashboard" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        ← Back to Workspace
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{project.title}</h1>
                            <p className="text-gray-500 mt-2 max-w-2xl">{project.description}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Invite
                            </button>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCreateDropdown(!showCreateDropdown);
                                    }}
                                    className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
                                >
                                    + Create
                                </button>
                                {showCreateDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button onClick={() => openModal('task')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center gap-3">
                                            <img src="/clipboard.png" alt="Task" className="w-5 h-5 object-contain" /> Task
                                        </button>
                                        <button onClick={() => openModal('list')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center gap-3">
                                            <img src="/list.png" alt="List" className="w-5 h-5 object-contain" /> List
                                        </button>
                                        <button onClick={() => openModal('page')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center gap-3">
                                            <img src="/page.png" alt="Page" className="w-5 h-5 object-contain" /> Page
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Layout */}
                <div className="space-y-12">
                    {/* Render Tasks in columns as before, but only root ones or those in lists */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {['todo', 'in-progress', 'done'].map(status => (
                            <div key={status} className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                                        {status.replace('-', ' ')}
                                    </h3>
                                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                        {items.filter(i => i.type === 'task' && i.status === status).length}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {items.filter(i => i.type === 'task' && i.status === status).map(task => (
                                        <div key={task._id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${task.priority === 'high' ? 'bg-red-50 text-red-600' :
                                                        task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-green-50 text-green-600'
                                                        }`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Render Pages and Lists below */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                        {items.filter(i => i.type !== 'task').map(item => (
                            <div key={item._id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center p-2.5 group-hover:bg-indigo-600 transition-colors">
                                            <img
                                                src={item.type === 'page' ? '/page.png' : '/list.png'}
                                                alt={item.type}
                                                className="w-full h-full object-contain group-hover:brightness-0 group-hover:invert"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                            <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-bold">{item.type}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-300 hover:text-indigo-600 transition-colors">•••</button>
                                </div>
                                {item.type === 'page' && (
                                    <p className="mt-4 text-gray-500 line-clamp-3 leading-relaxed">{item.content || item.description || 'No content yet...'}</p>
                                )}
                                {item.type === 'list' && (
                                    <div className="mt-6 space-y-3">
                                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 w-1/3 rounded-full"></div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grouped Activities</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Common Item Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">Create {modalType}</h2>
                        <form onSubmit={handleCreateItem} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder={`Name your ${modalType}...`}
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                />
                            </div>

                            {modalType !== 'list' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-24"
                                        placeholder="Brief details..."
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    ></textarea>
                                </div>
                            )}

                            {modalType === 'task' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Priority</label>
                                        <select
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none"
                                            value={newItem.priority}
                                            onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Status</label>
                                        <select
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none"
                                            value={newItem.status}
                                            onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                        >
                                            <option value="todo">To Do</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {modalType === 'page' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Content</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-48"
                                        placeholder="Write your page content here..."
                                        value={newItem.content}
                                        onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                                    ></textarea>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                                >
                                    Create {modalType}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Member</h2>
                        <p className="text-sm text-gray-500 mb-6">Share this project with your colleagues.</p>

                        <form onSubmit={handleInviteMember} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="colleague@company.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>

                            {inviteStatus.message && (
                                <div className={`p-4 rounded-xl text-sm font-medium ${inviteStatus.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' :
                                    inviteStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
                                        'bg-gray-50 text-gray-600'
                                    }`}>
                                    {inviteStatus.message}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteStatus.type === 'loading'}
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                                >
                                    Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
