import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '' });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', newProject);
            setNewProject({ title: '', description: '' });
            setShowCreateModal(false);
            fetchProjects();
        } catch (err) {
            console.error('Error creating project:', err);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>My Workspace</h1>
                    <p>Manage your projects and stay on track.</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    + New Project
                </Button>
            </div>

            {loading ? (
                <div className="dashboard-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton"></div>
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="dashboard-grid">
                    {projects.map(project => (
                        <Link
                            key={project._id}
                            to={`/projects/${project._id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <Card className="project-card hover-glow">
                                <div>
                                    <div className="project-icon-wrapper">
                                        {project.icon || '🚀'}
                                    </div>
                                    <h3 className="project-title">{project.title}</h3>
                                    <p className="project-desc">
                                        {project.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div className="project-footer">
                                    <span>
                                        By {project.owner?._id === user?.id || project.owner === user?.id ? 'You' : project.owner?.name || 'Unknown'}
                                    </span>
                                    <span className="project-link-text">Open Project →</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">✨</div>
                    <h3 className="title-small">Your workspace is empty</h3>
                    <p className="empty-text">Create your first project to start organizing your work and achieve your goals.</p>
                    <Button variant="ghost" onClick={() => setShowCreateModal(true)}>
                        Create a Project
                    </Button>
                </div>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Project"
                description="Start a new journey."
            >
                <form onSubmit={handleCreateProject} className="create-form">
                    <Input
                        label="Project Title"
                        placeholder="Software Launch 2026"
                        required
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                    <div className="ui-input-wrapper">
                        <label className="ui-label">Description (Optional)</label>
                        <textarea
                            className="ui-input"
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            placeholder="High-level goals and timeline..."
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            style={{ flex: 1 }}
                        >
                            Create Protocol
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
