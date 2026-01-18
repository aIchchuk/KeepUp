import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import StatusColumn from '../components/StatusColumn';
import TaskCard from '../components/TaskCard';

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
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null); // 'status' or 'priority'
    const [editItemData, setEditItemData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        content: ''
    });
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Avoid accidental drags when clicking
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    useEffect(() => {
        const handleClickAway = () => {
            setShowCreateDropdown(false);
            setOpenDropdown(null);
        };
        if (showCreateDropdown || openDropdown) {
            window.addEventListener('click', handleClickAway);
        }
        return () => window.removeEventListener('click', handleClickAway);
    }, [showCreateDropdown, openDropdown]);

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

    const handleDeleteItem = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/projects/${id}/tasks/${taskId}`);
            setShowEditModal(false);
            fetchProjectData();
        } catch (err) {
            console.error('Error deleting item:', err);
            alert(`Failed to delete item: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/projects/${id}/tasks/${selectedItem._id}`, editItemData);
            setShowEditModal(false);
            fetchProjectData();
        } catch (err) {
            console.error('Error updating item:', err);
            alert(`Failed to update item: ${err.response?.data?.message || err.message}`);
        }
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setEditItemData({
            title: item.title,
            description: item.description || '',
            priority: item.priority || 'medium',
            status: item.status || 'todo',
            content: item.content || ''
        });
        setShowEditModal(true);
    };

    const handleQuickStatusUpdate = async (item, newStatus) => {
        try {
            // Optimistic Update
            setItems(prev => prev.map(i => i._id === item._id ? { ...i, status: newStatus } : i));

            await api.patch(`/projects/${id}/tasks/${item._id}`, { status: newStatus });
            fetchProjectData();
        } catch (err) {
            console.error('Error updating status:', err);
            alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
            fetchProjectData(); // Revert on failure
        }
    };

    const handleDragStart = (event) => {
        const { active } = event;
        const task = items.find(i => i._id === active.id);
        setActiveTask(task);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const overStatus = over.data.current?.status || over.data.current?.task?.status;
        const activeTask = items.find(i => i._id === active.id);

        if (activeTask && overStatus && activeTask.status !== overStatus) {
            try {
                // Optimistic Update
                setItems(prev => prev.map(i => i._id === active.id ? { ...i, status: overStatus } : i));

                await api.patch(`/projects/${id}/tasks/${active.id}`, { status: overStatus });
                fetchProjectData();
            } catch (err) {
                console.error('Error moving task:', err);
                fetchProjectData(); // Revert on failure
            }
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold text-xl">Loading project...</div>;
    if (!project) return <div className="p-20 text-center">Project not found. <Link to="/dashboard" className="text-indigo-600 underline">Back to Dashboard</Link></div>;

    const rootItems = items.filter(item => !item.parentId);

    return (
        <div className="min-h-screen bg-white">
            {/* Cover Image */}
            <div className="h-[300px] w-full relative group overflow-hidden">
                <img
                    src={project.coverImage || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000"}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/20" />
                <button className="absolute bottom-6 right-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-gray-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg">
                    Change Cover
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-12 pb-20">
                {/* Header Section */}
                <div className="relative -mt-12 mb-10 space-y-4">
                    {/* Icon / Emoji */}
                    <div className="text-5xl bg-white w-24 h-24 rounded-[28px] shadow-xl flex items-center justify-center border-4 border-white transform transition-all hover:scale-105 cursor-pointer relative group/icon group">
                        {project.icon || "🚀"}
                        <div className="absolute inset-0 bg-black/0 group-hover/icon:bg-black/5 rounded-[28px] transition-all" />
                    </div>

                    <div className="flex items-end justify-between gap-10">
                        <div className="flex-1 space-y-3">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                {project.title}
                            </h1>
                            <p className="text-base text-gray-400 font-medium max-w-2xl leading-relaxed">
                                {project.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 pb-4">
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="bg-white text-gray-700 border border-gray-100 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Invite
                            </button>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCreateDropdown(!showCreateDropdown);
                                    }}
                                    className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-2xl shadow-gray-200"
                                >
                                    + Add Item
                                </button>
                                {showCreateDropdown && (
                                    <div className="absolute right-0 top-full mt-6 w-80 bg-white border border-gray-100 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-4 z-50 animate-in fade-in slide-in-from-top-6 duration-300">
                                        <div className="px-4 py-2 mb-3">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workspace Addition</p>
                                        </div>
                                        <button
                                            onClick={() => openModal('task')}
                                            className="w-full text-left p-5 hover:bg-indigo-50/50 rounded-3xl transition-all group flex items-start gap-5"
                                        >
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                                <img src="/clipboard.png" alt="Task" className="w-6 h-6 object-contain" />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gray-900">New Task</p>
                                                <p className="text-xs text-gray-500 mt-1">Assign work with status & priority</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => openModal('list')}
                                            className="w-full text-left p-5 hover:bg-violet-50/50 rounded-3xl transition-all group flex items-start gap-5"
                                        >
                                            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                                <img src="/list.png" alt="List" className="w-6 h-6 object-contain" />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gray-900">New List</p>
                                                <p className="text-xs text-gray-500 mt-1">Group related tasks together</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => openModal('page')}
                                            className="w-full text-left p-5 hover:bg-amber-50/50 rounded-3xl transition-all group flex items-start gap-5"
                                        >
                                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                                <img src="/page.png" alt="Page" className="w-6 h-6 object-contain" />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gray-900">New Page</p>
                                                <p className="text-xs text-gray-500 mt-1">Immersive canvas for documentation</p>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Layout */}
                <div className="space-y-12">
                    {/* Draggable Task Board */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {['todo', 'in-progress', 'done'].map(status => (
                                <StatusColumn
                                    key={status}
                                    status={status}
                                    items={items.filter(i => i.type === 'task' && i.status === status)}
                                    onTaskClick={openEditModal}
                                    onQuickStatusUpdate={handleQuickStatusUpdate}
                                />
                            ))}
                        </div>

                        <DragOverlay adjustScale={false}>
                            {activeTask ? (
                                <TaskCard
                                    task={activeTask}
                                    onClick={() => { }}
                                    onQuickStatusUpdate={() => { }}
                                    isOverlay={true}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {/* Render Pages and Lists below */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">
                        {items.filter(i => i.type !== 'task').map(item => (
                            <div
                                key={item._id}
                                onClick={() => openEditModal(item)}
                                className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer hover:-translate-y-2 relative"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center p-3.5 transition-all ${item.type === 'page' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600' : 'bg-violet-50 text-violet-600 group-hover:bg-violet-600'}`}>
                                            <img
                                                src={item.type === 'page' ? '/page.png' : '/list.png'}
                                                alt={item.type}
                                                className="w-full h-full object-contain group-hover:brightness-0 group-hover:invert transition-all"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{item.title}</h3>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">{item.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item._id); }}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                                {item.type === 'page' && (
                                    <div className="mt-6">
                                        <p className="text-gray-500 line-clamp-2 leading-relaxed text-lg italic">{item.content || item.description || 'Blank canvas...'}</p>
                                    </div>
                                )}
                                {item.type === 'list' && (
                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                            <span>Sub-items</span>
                                            <span>{items.filter(i => i.parentId === item._id).length} items</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                            <div className="h-full bg-violet-600 w-1/4 rounded-full shadow-sm"></div>
                                        </div>
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

            {/* Side-Peek Detail Drawer */}
            <div className={`fixed inset-y-0 right-0 w-[600px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-[150] transform transition-transform duration-500 ease-out border-l border-gray-100 flex flex-col ${showEditModal ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedItem && (
                    <>
                        {/* Drawer Header */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-900 group"
                                >
                                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                    <img
                                        src={selectedItem.type === 'task' ? '/clipboard.png' : selectedItem.type === 'list' ? '/list.png' : '/page.png'}
                                        alt={selectedItem.type}
                                        className="w-4 h-4 object-contain"
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{selectedItem.type}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDeleteItem(selectedItem._id)}
                                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                    title="Delete Permanently"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 space-y-12">
                            {/* Title Section */}
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    className="w-full bg-transparent text-4xl font-extrabold text-gray-900 border-none outline-none placeholder:text-gray-200 p-0 focus:ring-0"
                                    placeholder="Untitled"
                                    value={editItemData.title}
                                    onChange={(e) => setEditItemData({ ...editItemData, title: e.target.value })}
                                />

                                {selectedItem.type === 'task' && (
                                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50 mt-8">
                                        {/* Status Custom Dropdown */}
                                        <div className="flex flex-col gap-2 flex-1 relative">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Status</label>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'status' ? null : 'status'); }}
                                                className={`flex items-center justify-between bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-gray-100 ${editItemData.status === 'done' ? 'text-green-600' : editItemData.status === 'in-progress' ? 'text-indigo-600' : 'text-gray-700'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${editItemData.status === 'done' ? 'bg-green-500' : editItemData.status === 'in-progress' ? 'bg-indigo-500' : 'bg-gray-400'}`}></div>
                                                    <span className="capitalize">{editItemData.status.replace('-', ' ')}</span>
                                                </div>
                                                <svg className={`w-4 h-4 transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                            </button>

                                            {openDropdown === 'status' && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                                    {['todo', 'in-progress', 'done'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => { setEditItemData({ ...editItemData, status: s }); setOpenDropdown(null); }}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center gap-3"
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${s === 'done' ? 'bg-green-500' : s === 'in-progress' ? 'bg-indigo-500' : 'bg-gray-400'}`}></div>
                                                            <span className="capitalize">{s.replace('-', ' ')}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Priority Custom Dropdown */}
                                        <div className="flex flex-col gap-2 flex-1 relative">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Priority</label>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'priority' ? null : 'priority'); }}
                                                className={`flex items-center justify-between bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-gray-100 ${editItemData.priority === 'high' ? 'text-red-600' : editItemData.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${editItemData.priority === 'high' ? 'bg-red-500' : editItemData.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                                    <span className="capitalize">{editItemData.priority}</span>
                                                </div>
                                                <svg className={`w-4 h-4 transition-transform ${openDropdown === 'priority' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                            </button>

                                            {openDropdown === 'priority' && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                                    {['low', 'medium', 'high'].map(p => (
                                                        <button
                                                            key={p}
                                                            onClick={() => { setEditItemData({ ...editItemData, priority: p }); setOpenDropdown(null); }}
                                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-bold text-gray-700 flex items-center gap-3"
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${p === 'high' ? 'bg-red-500' : p === 'medium' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                                            <span className="capitalize">{p}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description Canvas */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Description</span>
                                </div>
                                <textarea
                                    className="w-full bg-transparent border-none outline-none text-gray-600 leading-relaxed min-h-[100px] resize-none p-0 focus:ring-0 text-lg placeholder:text-gray-200"
                                    placeholder="Add a detailed description..."
                                    value={editItemData.description}
                                    onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
                                />
                            </div>

                            {/* Workspace / Page Content */}
                            {selectedItem.type === 'page' && (
                                <div className="space-y-6 pt-12 border-t border-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-indigo-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            <span className="text-[11px] font-bold uppercase tracking-widest">Page Canvas</span>
                                        </div>
                                    </div>
                                    <textarea
                                        className="w-full bg-gray-50/50 rounded-[32px] p-10 border-none outline-none text-gray-800 leading-loose min-h-[500px] font-serif text-xl focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                                        placeholder="Begin your creative journey here..."
                                        value={editItemData.content}
                                        onChange={(e) => setEditItemData({ ...editItemData, content: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between gap-4">
                            <p className="text-[10px] text-gray-400 font-medium">Last synced: Just now</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateItem}
                                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 text-sm"
                                >
                                    Update {selectedItem.type}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Overlay */}
            {showEditModal && (
                <div
                    onClick={() => setShowEditModal(false)}
                    className="fixed inset-0 bg-gray-900/10 backdrop-blur-[2px] z-[140] animate-in fade-in duration-500"
                />
            )}
        </div>
    );
};

export default ProjectDetail;
