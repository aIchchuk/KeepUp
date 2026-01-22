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
import CalendarView from '../components/CalendarView';

const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [items, setItems] = useState([]);
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'calendar'
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
    const [showCoverModal, setShowCoverModal] = useState(false);
    const [showEmojiModal, setShowEmojiModal] = useState(false);
    const [tempCoverUrl, setTempCoverUrl] = useState('');
    const [tempEmoji, setTempEmoji] = useState('');
    const [createOpenDropdown, setCreateOpenDropdown] = useState(null);

    // Publish State
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishData, setPublishData] = useState({ price: '', description: '' });
    const [publishStatus, setPublishStatus] = useState({ type: '', message: '' });

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
        let content = item.content || '';
        if (item.type === 'list' && (!content || content.trim() === '' || content === '[]')) {
            content = JSON.stringify([{ id: Date.now(), text: '', checked: false }]);
        }
        setEditItemData({
            title: item.title,
            description: item.description || '',
            priority: item.priority || 'medium',
            status: item.status || 'todo',
            dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
            content: content
        });
        setShowEditModal(true);
    };

    const getChecklist = () => {
        try {
            return JSON.parse(editItemData.content || '[]');
        } catch (e) {
            return [];
        }
    };

    const updateChecklist = (newChecklist) => {
        setEditItemData(prev => ({ ...prev, content: JSON.stringify(newChecklist) }));
    };

    const handleChecklistKey = (e, index) => {
        const checklist = getChecklist();
        if (e.key === 'Enter') {
            e.preventDefault();
            const newList = [...checklist];
            newList.splice(index + 1, 0, { id: Date.now(), text: '', checked: false });
            updateChecklist(newList);
            // Focus next item after render
            setTimeout(() => {
                const inputs = document.querySelectorAll('.checklist-input');
                inputs[index + 1]?.focus();
            }, 0);
        } else if (e.key === 'Backspace' && checklist[index].text === '' && checklist.length > 1) {
            e.preventDefault();
            const newList = checklist.filter((_, i) => i !== index);
            updateChecklist(newList);
            // Focus previous item
            setTimeout(() => {
                const inputs = document.querySelectorAll('.checklist-input');
                inputs[index - 1]?.focus();
            }, 0);
        }
    };

    const handleProjectUpdate = async (updates) => {
        try {
            await api.patch(`/projects/${id}`, updates);
            setShowCoverModal(false);
            setShowEmojiModal(false);
            fetchProjectData();
        } catch (err) {
            console.error('Error updating project:', err);
            alert(`Failed to update project: ${err.response?.data?.message || err.message}`);
        }
    };

    const openCoverModal = () => {
        setTempCoverUrl(project.coverImage || '');
        setShowCoverModal(true);
    };

    const openEmojiModal = () => {
        setTempEmoji(project.icon || '🚀');
        setShowEmojiModal(true);
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

    const handlePublishProject = async (e) => {
        e.preventDefault();
        setPublishStatus({ type: 'loading', message: 'Publishing template...' });

        try {
            await api.post('/templates/publish', {
                projectId: id,
                title: project.title, // Default to project title, or add input if needed
                description: publishData.description || project.description,
                price: publishData.price
            });

            setPublishStatus({ type: 'success', message: 'Successfully published to Marketplace!' });
            setTimeout(() => {
                setShowPublishModal(false);
                setPublishStatus({ type: '', message: '' });
                setPublishData({ price: '', description: '' });
            }, 2000);
        } catch (err) {
            console.error('Publish error:', err);
            setPublishStatus({ type: 'error', message: err.response?.data?.message || 'Failed to publish' });
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
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Full-Screen Fixed Background (Content Area Only) */}
            <div
                className="fixed top-0 right-0 bottom-0 left-64 z-0 bg-gray-900 transition-all duration-700"
                style={{
                    backgroundImage: `url(${project.coverImage || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000"})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 min-h-screen flex flex-col pt-[9vh]">
                <div className="max-w-7xl mx-auto px-15 w-full pb-20">
                    {/* Main Content Box */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-[48px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)] border border-white/20 p-12 min-h-[610px]">
                        {/* Header Section */}
                        <div className="mb-12">
                            <div className="flex items-start justify-between gap-10">
                                <div className="flex-1 space-y-4">
                                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight flex items-center gap-7">
                                        <div
                                            onClick={openEmojiModal}
                                            className="w-16 h-16 bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] rounded-[22px] flex items-center justify-center text-2xl border-2 border-white flex-shrink-0 transition-all hover:scale-105 cursor-pointer active:scale-95 group ring-1 ring-gray-100/50 outline outline-offset-4 outline-2 outline-white/30"
                                        >
                                            {project.icon || "🚀"}
                                        </div>
                                        <span>{project.title}</span>
                                    </h1>
                                    <p className="text-xl text-gray-800 font-bold max-w-2xl leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                                        <button
                                            onClick={() => setViewMode('board')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('calendar')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowPublishModal(true)}
                                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all shadow-md flex items-center gap-2"
                                    >
                                        <span></span> Publish
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
                            {items.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-3xl shadow-inner border border-gray-100/50">
                                        ✨
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your project is empty</h2>
                                        <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                                            Start by adding a task to track your progress or a page to document your ideas.
                                        </p>
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                        <button
                                            onClick={() => openModal('task')}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 text-sm"
                                        >
                                            <span>+</span> Add Task
                                        </button>
                                        <button
                                            onClick={() => openModal('page')}
                                            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-100 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 text-sm"
                                        >
                                            <span>+</span> New Page
                                        </button>
                                    </div>
                                </div>
                            ) : viewMode === 'calendar' ? (
                                <CalendarView
                                    tasks={items.filter(i => i.type === 'task')}
                                    onTaskClick={openEditModal}
                                />
                            ) : (
                                <>
                                    {/* Draggable Task Board - Only show if there are tasks */}
                                    {items.some(i => i.type === 'task') && (
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
                                    )}

                                    {/* Render Pages and Lists below */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-40">
                                        {items.filter(i => i.type !== 'task').map(item => (
                                            <div
                                                key={item._id}
                                                onClick={() => openEditModal(item)}
                                                className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer hover:-translate-y-1 relative h-full flex flex-col justify-between mx-auto w-full max-w-[320px]"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center p-3 transition-all ${item.type === 'page' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600' : 'bg-violet-50 text-violet-600 group-hover:bg-violet-600'}`}>
                                                            <img
                                                                src={item.type === 'page' ? '/page.png' : '/list.png'}
                                                                alt={item.type}
                                                                className="w-full h-full object-contain group-hover:brightness-0 group-hover:invert transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">{item.title}</h3>
                                                            <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-widest font-black">{item.type}</p>
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
                                                    <div className="mt-4">
                                                        <p className="text-gray-500 line-clamp-2 leading-relaxed text-sm italic">{item.content || item.description || 'Blank canvas...'}</p>
                                                    </div>
                                                )}
                                                {item.type === 'list' && (
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                                            <span>Checklist</span>
                                                        </div>
                                                        <div className="bg-gray-50/50 rounded-xl p-2 border border-gray-100/50">
                                                            {(() => {
                                                                try {
                                                                    const checklist = JSON.parse(item.content || '[]');
                                                                    const total = checklist.length;
                                                                    const done = checklist.filter(i => i.checked).length;
                                                                    if (total === 0) return <p className="text-[10px] text-gray-300 italic px-1">Empty list</p>;
                                                                    return (
                                                                        <div className="space-y-1.5">
                                                                            <div className="flex items-center justify-between text-[9px] font-bold text-indigo-500 mb-1 px-1">
                                                                                <span>{Math.round((done / total) * 100)}% Complete</span>
                                                                                <span>{done}/{total}</span>
                                                                            </div>
                                                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                                                    style={{ width: `${(done / total) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                } catch (e) {
                                                                    return <p className="text-[10px] text-gray-300 italic px-1">Click to add items</p>;
                                                                }
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Common Item Modal */}
                        {showModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">Create {modalType}</h2>
                                    <form onSubmit={handleCreateItem} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-700 ml-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                                placeholder={`Name your ${modalType}...`}
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            />
                                        </div>

                                        {modalType !== 'list' && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-700 ml-1">Description</label>
                                                <textarea
                                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-20 text-sm"
                                                    placeholder="Brief details..."
                                                    value={newItem.description}
                                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                                ></textarea>
                                            </div>
                                        )}

                                        {modalType === 'task' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Status Custom Dropdown */}
                                                <div className="flex flex-col gap-2 flex-1 relative">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Status</label>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setCreateOpenDropdown(createOpenDropdown === 'status' ? null : 'status'); }}
                                                        className={`flex items-center justify-between bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-gray-100 ${newItem.status === 'done' ? 'text-green-600' : newItem.status === 'in-progress' ? 'text-indigo-600' : 'text-gray-700'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${newItem.status === 'done' ? 'bg-green-500' : newItem.status === 'in-progress' ? 'bg-indigo-500' : 'bg-gray-400'}`}></div>
                                                            <span className="capitalize">{newItem.status.replace('-', ' ')}</span>
                                                        </div>
                                                        <svg className={`w-4 h-4 transition-transform ${createOpenDropdown === 'status' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                                    </button>

                                                    {createOpenDropdown === 'status' && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                                            {['todo', 'in-progress', 'done'].map(s => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => { setNewItem({ ...newItem, status: s }); setCreateOpenDropdown(null); }}
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
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Priority</label>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setCreateOpenDropdown(createOpenDropdown === 'priority' ? null : 'priority'); }}
                                                        className={`flex items-center justify-between bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-gray-100 ${newItem.priority === 'high' ? 'text-red-600' : newItem.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${newItem.priority === 'high' ? 'bg-red-500' : newItem.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                                            <span className="capitalize">{newItem.priority}</span>
                                                        </div>
                                                        <svg className={`w-4 h-4 transition-transform ${createOpenDropdown === 'priority' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                                    </button>

                                                    {createOpenDropdown === 'priority' && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                                            {['low', 'medium', 'high'].map(p => (
                                                                <button
                                                                    key={p}
                                                                    type="button"
                                                                    onClick={() => { setNewItem({ ...newItem, priority: p }); setCreateOpenDropdown(null); }}
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

                                        {modalType === 'page' && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-700 ml-1">Content</label>
                                                <textarea
                                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-40 text-sm"
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
                                                className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all text-sm"
                                            >
                                                Create {modalType}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                        }

                        {/* Invite Modal */}
                        {
                            showInviteModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                                    <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">Invite Member</h2>
                                        <p className="text-xs text-gray-500 mb-4">Share this project with your colleagues.</p>

                                        <form onSubmit={handleInviteMember} className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                                    placeholder="colleague@company.com"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                />
                                            </div>

                                            {inviteStatus.message && (
                                                <div className={`p-3 rounded-xl text-xs font-medium ${inviteStatus.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' :
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
                                                    className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={inviteStatus.type === 'loading'}
                                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 text-sm"
                                                >
                                                    Invite
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )
                        }

                        {/* Cover Image Modal */}
                        {showCoverModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Update Cover Image</h2>
                                    <p className="text-xs text-gray-500 mb-4">Paste a direct image URL to update the project background.</p>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-700 ml-1">Image URL</label>
                                            <input
                                                type="text"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-[10px]"
                                                placeholder="https://example.com/image.jpg"
                                                value={tempCoverUrl}
                                                onChange={(e) => setTempCoverUrl(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => setShowCoverModal(false)}
                                                className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleProjectUpdate({ coverImage: tempCoverUrl })}
                                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg text-sm"
                                            >
                                                Update Cover
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Emoji Picker Modal */}
                        {showEmojiModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">Select Icon</h2>
                                    <p className="text-xs text-gray-500 mb-6">Choose an identity for this project.</p>

                                    <div className="grid grid-cols-4 gap-4 mb-8">
                                        {['🚀', '✨', '🔥', '💡', '🎨', '📁', '🛠️', '📅', '📝', '📎', '🔒', '🎯'].map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleProjectUpdate({ icon: emoji })}
                                                className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl transition-all hover:bg-gray-50 hover:scale-110 active:scale-95 ${project.icon === emoji ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'bg-white border border-gray-100'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setShowEmojiModal(false)}
                                        className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Publish Template Modal */}
                        {showPublishModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center text-3xl mb-4">
                                            💎
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 text-center">Publish to Marketplace</h2>
                                        <p className="text-xs text-gray-500 text-center mt-1">Earn money by sharing your workflow.</p>
                                    </div>

                                    <form onSubmit={handlePublishProject} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-700 ml-1">Price ($)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                required
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-sm font-bold"
                                                placeholder="0.00"
                                                value={publishData.price}
                                                onChange={(e) => setPublishData({ ...publishData, price: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-700 ml-1">Marketing Description</label>
                                            <textarea
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all h-24 text-sm"
                                                placeholder="Why should people buy this template?"
                                                value={publishData.description}
                                                onChange={(e) => setPublishData({ ...publishData, description: e.target.value })}
                                            ></textarea>
                                        </div>

                                        {publishStatus.message && (
                                            <div className={`p-3 rounded-xl text-xs font-medium text-center ${publishStatus.type === 'success' ? 'bg-green-50 text-green-600' :
                                                publishStatus.type === 'error' ? 'bg-red-50 text-red-600' :
                                                    'bg-gray-50 text-gray-600 animate-pulse'
                                                }`}>
                                                {publishStatus.message}
                                            </div>
                                        )}

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowPublishModal(false)}
                                                className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={publishStatus.type === 'loading'}
                                                className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 disabled:opacity-50 text-sm"
                                            >
                                                {publishStatus.type === 'loading' ? 'Publishing...' : 'Publish Now'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Side-Peek Detail Drawer */}
                        <div
                            className={`fixed inset-y-0 right-0 left-64 z-[100] bg-white transform transition-transform duration-300 ease-in-out flex flex-col ${showEditModal ? 'translate-x-0' : 'translate-x-full'}`}
                        >
                            {selectedItem && (
                                <>
                                    {/* Drawer Header */}
                                    <div className="p-10 border-b border-gray-100/50 flex items-center justify-between bg-white/40 backdrop-blur-xl sticky top-0 z-10">
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => setShowEditModal(false)}
                                                className="p-3.5 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm hover:shadow-md border border-transparent hover:border-gray-50 group"
                                            >
                                                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <div className="flex items-center gap-2.5 px-4 py-2 bg-indigo-50/50 backdrop-blur-md rounded-full border border-indigo-100/50">
                                                <img
                                                    src={selectedItem.type === 'task' ? '/clipboard.png' : selectedItem.type === 'list' ? '/list.png' : '/page.png'}
                                                    alt={selectedItem.type}
                                                    className="w-4 h-4 object-contain"
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500">{selectedItem.type}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleDeleteItem(selectedItem._id)}
                                                className="p-3.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-red-50"
                                                title="Delete Permanently"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Drawer Content */}
                                    <div className={`flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10`}>
                                        {/* Title Section */}
                                        <div className="space-y-8">
                                            <div className="relative group/title">
                                                <div className="flex items-center gap-2 mb-4 opacity-0 group-hover/title:opacity-100 transition-opacity">
                                                    <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded text-xs text-gray-500 font-medium transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Add icon
                                                    </button>
                                                    <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded text-xs text-gray-500 font-medium transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        Add cover
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent text-5xl font-black text-gray-900 border-none outline-none placeholder:text-gray-200 p-0 focus:ring-0 leading-tight tracking-tight transition-all"
                                                    placeholder="Untitled"
                                                    value={editItemData.title}
                                                    onChange={(e) => setEditItemData({ ...editItemData, title: e.target.value })}
                                                />
                                            </div>

                                            {selectedItem.type === 'task' && (
                                                <div className="pt-2 space-y-1">
                                                    {/* Status Property */}
                                                    <div className="group/prop flex items-center min-h-[32px]">
                                                        <div className="w-[120px] flex items-center gap-2 text-gray-400">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            <span className="text-sm font-medium">Status</span>
                                                        </div>
                                                        <div className="relative flex-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'status' ? null : 'status'); }}
                                                                className={`px-2 py-1 -ml-2 rounded-md hover:bg-gray-100 transition-all text-sm font-medium flex items-center gap-2 ${editItemData.status === 'done' ? 'text-green-600' : editItemData.status === 'in-progress' ? 'text-indigo-600' : 'text-gray-700'}`}
                                                            >
                                                                <span className="capitalize">{editItemData.status.replace('-', ' ')}</span>
                                                            </button>
                                                            {openDropdown === 'status' && (
                                                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1">
                                                                    {['todo', 'in-progress', 'done'].map(s => (
                                                                        <button
                                                                            key={s}
                                                                            onClick={() => { setEditItemData({ ...editItemData, status: s }); setOpenDropdown(null); }}
                                                                            className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-sm text-gray-700 capitalize"
                                                                        >
                                                                            {s.replace('-', ' ')}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Priority Property */}
                                                    <div className="group/prop flex items-center min-h-[32px]">
                                                        <div className="w-[120px] flex items-center gap-2 text-gray-400">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                            <span className="text-sm font-medium">Priority</span>
                                                        </div>
                                                        <div className="relative flex-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'priority' ? null : 'priority'); }}
                                                                className={`px-2 py-1 -ml-2 rounded-md hover:bg-gray-100 transition-all text-sm font-medium flex items-center gap-2 ${editItemData.priority === 'high' ? 'text-red-500' : editItemData.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}
                                                            >
                                                                <span className="capitalize">{editItemData.priority}</span>
                                                            </button>
                                                            {openDropdown === 'priority' && (
                                                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1">
                                                                    {['low', 'medium', 'high'].map(p => (
                                                                        <button
                                                                            key={p}
                                                                            onClick={() => { setEditItemData({ ...editItemData, priority: p }); setOpenDropdown(null); }}
                                                                            className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-sm text-gray-700 capitalize"
                                                                        >
                                                                            {p}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Due Date Property */}
                                                    <div className="group/prop flex items-center min-h-[32px]">
                                                        <div className="w-[120px] flex items-center gap-2 text-gray-400">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            <span className="text-sm font-medium">Due Date</span>
                                                        </div>
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="date"
                                                                className="px-2 py-1 -ml-2 rounded-md hover:bg-gray-100 transition-all text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer"
                                                                value={editItemData.dueDate || ''}
                                                                onChange={(e) => setEditItemData({ ...editItemData, dueDate: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Divider */}
                                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                                        {/* Workspace Content */}
                                        <div className="min-h-[400px]">
                                            {/* Description Canvas */}
                                            {selectedItem.type !== 'list' && (
                                                <div className="space-y-4">
                                                    <textarea
                                                        className="w-full bg-transparent border-none outline-none text-gray-800 leading-relaxed min-h-[300px] resize-none p-0 focus:ring-0 text-lg placeholder:text-gray-300"
                                                        placeholder="Press '/' for commands..."
                                                        value={editItemData.description}
                                                        onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {/* Workspace / Page Content */}
                                            {selectedItem.type === 'list' && (
                                                <div className="space-y-8 pt-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 text-violet-500">
                                                            <div className="p-2 bg-violet-50 rounded-xl">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                            </div>
                                                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Checklist</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Enter to add</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        {getChecklist().map((item, idx) => (
                                                            <div key={item.id} className="flex items-center gap-3 group/check">
                                                                <button
                                                                    onClick={() => {
                                                                        const newList = getChecklist();
                                                                        newList[idx].checked = !newList[idx].checked;
                                                                        updateChecklist(newList);
                                                                    }}
                                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${item.checked ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'border-gray-100 group-hover/check:border-indigo-200'}`}
                                                                >
                                                                    {item.checked && (
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                                                    )}
                                                                </button>
                                                                <input
                                                                    type="text"
                                                                    className={`checklist-input flex-1 bg-transparent border-none outline-none text-sm transition-all p-0 focus:ring-0 ${item.checked ? 'text-gray-300 line-through' : 'text-gray-700 font-medium'}`}
                                                                    placeholder="Type an item..."
                                                                    value={item.text}
                                                                    onChange={(e) => {
                                                                        const newList = getChecklist();
                                                                        newList[idx].text = e.target.value;
                                                                        updateChecklist(newList);
                                                                    }}
                                                                    onKeyDown={(e) => handleChecklistKey(e, idx)}
                                                                    autoFocus={idx === getChecklist().length - 1 && item.text === ''}
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        if (getChecklist().length > 1) {
                                                                            const newList = getChecklist();
                                                                            newList.splice(idx, 1);
                                                                            updateChecklist(newList);
                                                                        }
                                                                    }}
                                                                    className="opacity-0 group-hover/check:opacity-100 p-1.5 text-gray-300 hover:text-red-400 transition-all"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedItem.type === 'page' && (
                                                <div className="space-y-8">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 text-indigo-500/40">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-1">Composition Canvas</span>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        className="w-full bg-transparent outline-none text-gray-800 leading-relaxed min-h-[600px] text-2xl focus:ring-0 transition-all scrollbar-hide resize-none p-0"
                                                        placeholder="Write your story here..."
                                                        value={editItemData.content}
                                                        onChange={(e) => setEditItemData({ ...editItemData, content: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Drawer Footer */}
                                    <div className="p-10 bg-white/40 backdrop-blur-xl border-t border-gray-100/50 flex items-center justify-between gap-6 sticky bottom-0">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 rounded-full border border-gray-100/50">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Auto-saved</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setShowEditModal(false)}
                                                className="px-8 py-4 text-gray-500 font-black hover:text-gray-900 transition-all text-xs uppercase tracking-widest"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                onClick={handleUpdateItem}
                                                className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] font-black hover:bg-indigo-700 transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.4)] text-xs uppercase tracking-[0.2em] transform active:scale-95"
                                            >
                                                Update {selectedItem.type.toUpperCase()}
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
                </div>
            </div >
        </div >
    );
};

export default ProjectDetail;
