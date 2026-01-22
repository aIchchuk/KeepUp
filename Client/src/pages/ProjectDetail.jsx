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
    DragOverlay
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import StatusColumn from '../components/StatusColumn';
import TaskCard from '../components/TaskCard';
import CalendarView from '../components/CalendarView';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import TaskDetail from '../components/details/TaskDetail';
import ListDetail from '../components/details/ListDetail';
import PageDetail from '../components/details/PageDetail';
import '../styles/ProjectDetail.css';

const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [items, setItems] = useState([]);
    const [viewMode, setViewMode] = useState('board');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [modalType, setModalType] = useState('task');
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
    const [openDropdown, setOpenDropdown] = useState(null);
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
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishData, setPublishData] = useState({ price: '', description: '' });
    const [publishStatus, setPublishStatus] = useState({ type: '', message: '' });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
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

    const openEmojiModal = () => {
        setTempEmoji(project.icon || '🚀');
        setShowEmojiModal(true);
    };

    const handleQuickStatusUpdate = async (item, newStatus) => {
        try {
            setItems(prev => prev.map(i => i._id === item._id ? { ...i, status: newStatus } : i));
            await api.patch(`/projects/${id}/tasks/${item._id}`, { status: newStatus });
            fetchProjectData();
        } catch (err) {
            console.error('Error updating status:', err);
            alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
            fetchProjectData();
        }
    };

    const handlePublishProject = async (e) => {
        e.preventDefault();
        setPublishStatus({ type: 'loading', message: 'Publishing template...' });
        try {
            await api.post('/templates/publish', {
                projectId: id,
                title: project.title,
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
                setItems(prev => prev.map(i => i._id === active.id ? { ...i, status: overStatus } : i));
                // TODO: Actual API call for move if needed, for now just status update handles it via re-fetch or internal logic
            } catch (err) {
                console.error('Error moving task:', err);
                fetchProjectData();
            }
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
    if (!project) return <div className="p-20 text-center">Project not found. <Link to="/dashboard" className="text-indigo-600 underline">Back to Dashboard</Link></div>;

    return (
        <div className="project-detail-container">
            {/* Background Image */}
            <div
                className="project-bg-image"
                style={{ backgroundImage: `url(${project.coverImage || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000"})` }}
            >
                <div className="project-bg-overlay" />
            </div>

            <div className="project-content">
                <div className="project-header-card">
                    <div className="header-top">
                        <div className="project-info">
                            <h1>
                                <div onClick={openEmojiModal} className="project-icon">
                                    {project.icon || "🚀"}
                                </div>
                                {project.title}
                            </h1>
                            <p className="project-description">{project.description}</p>
                        </div>
                        <div className="header-actions">
                            <div className="view-toggle">
                                <button className={`view-btn ${viewMode === 'board' ? 'active' : ''}`} onClick={() => setViewMode('board')}>
                                    Board
                                </button>
                                <button className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>
                                    Calendar
                                </button>
                            </div>
                            <Button variant="ghost" onClick={() => { setTempCoverUrl(project.coverImage || ''); setShowCoverModal(true); }}>
                                Cover
                            </Button>
                            <Button variant="ghost" onClick={() => setShowInviteModal(true)}>
                                Invite
                            </Button>
                            <Button variant="primary" onClick={() => setShowPublishModal(true)}>
                                Publish
                            </Button>
                            <div style={{ position: 'relative' }}>
                                <Button onClick={(e) => { e.stopPropagation(); setShowCreateDropdown(!showCreateDropdown); }}>
                                    + Add Item
                                </Button>
                                {showCreateDropdown && (
                                    <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '10px', width: '250px', padding: '10px', zIndex: 50 }}>
                                        <button onClick={() => openModal('task')} className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>New Task</button>
                                        <button onClick={() => openModal('list')} className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>New List</button>
                                        <button onClick={() => openModal('page')} className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>New Page</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {viewMode === 'calendar' ? (
                    <CalendarView tasks={items.filter(i => i.type === 'task')} onTaskClick={openEditModal} />
                ) : (
                    <>
                        {items.some(i => i.type === 'task') && (
                            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                <div className="board-grid">
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
                                    {activeTask ? <TaskCard task={activeTask} onClick={() => { }} onQuickStatusUpdate={() => { }} isOverlay={true} /> : null}
                                </DragOverlay>
                            </DndContext>
                        )}

                        <div className="item-grid">
                            {items.filter(i => i.type !== 'task').map(item => (
                                <div key={item._id} className="item-card" onClick={() => openEditModal(item)}>
                                    <div className="item-icon">
                                        {item.type === 'page' ? '📄' : '📝'}
                                    </div>
                                    <h3 className="task-title">{item.title}</h3>
                                    <p className="item-type">{item.type}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Create ${modalType}`}>
                <form onSubmit={handleCreateItem} className="ui-input-wrapper" style={{ gap: '16px' }}>
                    <Input label="Title" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} required placeholder={`Name your ${modalType}...`} />
                    {modalType !== 'list' && (
                        <div className="ui-input-wrapper">
                            <label className="ui-label">Description</label>
                            <textarea className="ui-input" rows="3" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Brief details..." />
                        </div>
                    )}
                    {modalType === 'task' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="ui-input-wrapper">
                                <label className="ui-label">Priority</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['low', 'medium', 'high'].map(priority => (
                                        <button
                                            type="button"
                                            key={priority}
                                            onClick={() => setNewItem({ ...newItem, priority })}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: `1px solid ${newItem.priority === priority ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                                background: newItem.priority === priority ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
                                                color: newItem.priority === priority ? 'white' : 'var(--text-muted)',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize',
                                                fontWeight: 600
                                            }}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="ui-input-wrapper">
                                <label className="ui-label">Status</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['todo', 'in-progress', 'done'].map(status => (
                                        <button
                                            type="button"
                                            key={status}
                                            onClick={() => setNewItem({ ...newItem, status })}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: `1px solid ${newItem.status === status ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                                                background: newItem.status === status ? 'rgba(138, 43, 226, 0.2)' : 'transparent',
                                                color: newItem.status === status ? 'white' : 'var(--text-muted)',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize',
                                                fontWeight: 600
                                            }}
                                        >
                                            {status.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</Button>
                        <Button variant="primary" type="submit" style={{ flex: 1 }}>Create</Button>
                    </div>
                </form>
            </Modal>

            {/* Invite Modal */}
            <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Member">
                <form onSubmit={handleInviteMember} className="ui-input-wrapper" style={{ gap: '16px' }}>
                    <Input
                        label="Email Address"
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                        placeholder="colleague@example.com"
                    />
                    {inviteStatus.message && (
                        <div className={`status-message ${inviteStatus.type === 'success' ? 'success' : 'error'}`} style={{ padding: '10px', borderRadius: '8px', marginTop: '10px', background: inviteStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: inviteStatus.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                            {inviteStatus.message}
                        </div>
                    )}
                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowInviteModal(false)} style={{ flex: 1 }}>Cancel</Button>
                        <Button variant="primary" type="submit" style={{ flex: 1 }}>Send Invite</Button>
                    </div>
                </form>
            </Modal>

            {/* Cover Image Modal */}
            <Modal isOpen={showCoverModal} onClose={() => setShowCoverModal(false)} title="Change Cover Image">
                <div className="ui-input-wrapper" style={{ gap: '16px' }}>
                    <Input
                        label="Image URL"
                        type="url"
                        value={tempCoverUrl}
                        onChange={e => setTempCoverUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowCoverModal(false)} style={{ flex: 1 }}>Cancel</Button>
                        <Button variant="primary" onClick={() => handleProjectUpdate({ coverImage: tempCoverUrl })} style={{ flex: 1 }}>Update Cover</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Drawer */}
            {/* Overlay moved outside to avoid transform stacking context issues */}
            {showEditModal && <div className="drawer-overlay" onClick={() => setShowEditModal(false)}></div>}

            <div className={`drawer ${showEditModal ? 'open' : ''} z-[150]`}>
                {selectedItem && (
                    <>
                        <div className="drawer-header">
                            <span className="item-type">{selectedItem.type}</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Button variant="danger" onClick={() => handleDeleteItem(selectedItem._id)}>Delete</Button>
                                <button onClick={() => setShowEditModal(false)} className="ui-modal-close" style={{ position: 'static' }}>&times;</button>
                            </div>
                        </div>
                        <div className="drawer-content">
                            <div className="ui-input-wrapper" style={{ marginBottom: '20px' }}>
                                <input
                                    className="ui-input"
                                    style={{ fontSize: '24px', fontWeight: 'bold', border: 'none', background: 'transparent', padding: 0 }}
                                    value={editItemData.title}
                                    onChange={e => setEditItemData({ ...editItemData, title: e.target.value })}
                                />
                            </div>

                            {selectedItem.type === 'task' && (
                                <TaskDetail data={editItemData} onChange={setEditItemData} />
                            )}

                            {selectedItem.type === 'list' && (
                                <ListDetail data={editItemData} onChange={setEditItemData} />
                            )}

                            {selectedItem.type === 'page' && (
                                <PageDetail data={editItemData} onChange={setEditItemData} />
                            )}
                        </div>
                        <div className="drawer-footer">
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleUpdateItem}>Save Changes</Button>
                        </div>
                    </>
                )}
            </div>

            {/* Publish Modal */}
            <Modal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} title="Publish to Marketplace">
                <form onSubmit={handlePublishProject} className="ui-input-wrapper" style={{ gap: '16px' }}>
                    <Input label="Price ($)" type="number" step="0.01" value={publishData.price} onChange={e => setPublishData({ ...publishData, price: e.target.value })} required placeholder="0.00" />
                    <div className="ui-input-wrapper">
                        <label className="ui-label">Description</label>
                        <textarea className="ui-input" rows="4" value={publishData.description} onChange={e => setPublishData({ ...publishData, description: e.target.value })} placeholder="Why should people buy this?" />
                    </div>
                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowPublishModal(false)} style={{ flex: 1 }}>Cancel</Button>
                        <Button variant="primary" type="submit" style={{ flex: 1 }}>Publish</Button>
                    </div>
                </form>
            </Modal>

            {/* Emoji Modal */}
            <Modal isOpen={showEmojiModal} onClose={() => setShowEmojiModal(false)} title="Select Icon">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {['🚀', '✨', '🔥', '💡', '🎨', '📁', '🛠️', '📅', '📝', '📎', '🔒', '🎯'].map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => handleProjectUpdate({ icon: emoji })}
                            style={{ fontSize: '24px', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: project.icon === emoji ? 'var(--primary-color)' : 'transparent', cursor: 'pointer', color: 'white' }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                <Button variant="secondary" onClick={() => setShowEmojiModal(false)} style={{ width: '100%' }}>Close</Button>
            </Modal>
        </div>
    );
};

export default ProjectDetail;
