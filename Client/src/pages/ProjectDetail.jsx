import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState({ type: '', message: '' });


    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            const [projRes, tasksRes] = await Promise.all([
                api.get(`/projects`), // Backend getProjects currently returns all, I'll filter or assume list
                api.get(`/projects/${id}/tasks`)
            ]);

            // Temporary: Find the specific project from the list since there's no getProjectById endpoint yet
            const foundProject = projRes.data.find(p => p._id === id);
            setProject(foundProject);
            setTasks(tasksRes.data);
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


    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/projects/${id}/tasks`, newTask);
            setNewTask({ title: '', description: '', priority: 'medium' });
            setShowTaskModal(false);
            fetchProjectData();
        } catch (err) {
            console.error('Error creating task:', err);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold text-xl">Loading project...</div>;
    if (!project) return <div className="p-20 text-center">Project not found. <Link to="/dashboard" className="text-indigo-600 underline">Back to Dashboard</Link></div>;

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
                            <button
                                onClick={() => setShowTaskModal(true)}
                                className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
                            >
                                + Add Task
                            </button>
                        </div>

                    </div>
                </div>

                {/* Task Board / List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {['todo', 'in-progress', 'done'].map(status => (
                        <div key={status} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                                    {status.replace('-', ' ')}
                                </h3>
                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                    {tasks.filter(t => t.status === status).length}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {tasks.filter(t => t.status === status).map(task => (
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
            </div>

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

            {/* Task Creation Modal */}

            {showTaskModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>
                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Design Landing Page"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-24"
                                    placeholder="Brief details about this task..."
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Priority</label>
                                <select
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                                >
                                    Create Task
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
