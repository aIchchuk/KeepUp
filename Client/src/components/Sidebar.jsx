import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error('Error fetching projects for sidebar:', err);
        }
    };

    const handleTogglePin = async (e, projectId) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update
        setProjects(prev => prev.map(p => {
            if (p._id === projectId) {
                const memberIndex = p.members.findIndex(m => m.user === user?._id || m.user?._id === user?._id);
                if (memberIndex !== -1) {
                    const newMembers = [...p.members];
                    newMembers[memberIndex] = { ...newMembers[memberIndex], isPinned: !newMembers[memberIndex].isPinned };
                    return { ...p, members: newMembers };
                }
            }
            return p;
        }));

        try {
            await api.patch(`/projects/${projectId}/pin`);
            fetchProjects(); // Sync with server for clarity
        } catch (err) {
            console.error('Error pinning project:', err);
            fetchProjects(); // Revert on error
        }
    };

    const pinnedProjects = projects.filter(p => {
        const member = p.members.find(m => m.user === user?._id || m.user?._id === user?._id);
        return member?.isPinned;
    });

    const otherProjects = projects.filter(p => {
        const member = p.members.find(m => m.user === user?._id || m.user?._id === user?._id);
        return !member?.isPinned;
    });

    const navItems = [
        { name: 'Dashboard', icon: '/dashboard.png', path: '/dashboard' },
        { name: 'Marketplace', icon: '/search-engine.png', path: '/marketplace' },
        { name: 'My Cart', icon: '/shopping-cart.png', path: '/cart' },
        { name: 'Profile', icon: '/user.png', path: '/profile' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <div className="brand-icon">K</div>
                    <span className="brand-text">KeepUp</span>
                </div>

                <div className="sidebar-search">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="Quick Search..."
                        className="search-input"
                    />
                    <div className="shortcut-badge">Ctrl K</div>
                </div>
            </div>

            <nav className="sidebar-nav custom-scrollbar">
                <div className="nav-group">
                    <p className="nav-section-title">General</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <img
                                src={item.icon}
                                alt={item.name}
                                className="nav-icon"
                            />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="nav-group">
                    {/* Pinned Projects Section */}
                    {pinnedProjects.length > 0 && (
                        <>
                            <p className="nav-section-title">Pinned</p>
                            {pinnedProjects.map((proj) => (
                                <NavLink
                                    key={proj._id}
                                    to={`/projects/${proj._id}`}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <span className="project-emoji">{proj.icon || '🚀'}</span>
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.title}</span>
                                    <button
                                        onClick={(e) => handleTogglePin(e, proj._id)}
                                        className="pin-btn active"
                                        title="Unpin Project"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" /></svg>
                                    </button>
                                </NavLink>
                            ))}
                        </>
                    )}

                    <div className="nav-group-header">
                        <p className="nav-section-title">Projects</p>
                        <button className="add-project-btn">+</button>
                    </div>

                    {otherProjects.map((proj) => (
                        <NavLink
                            key={proj._id}
                            to={`/projects/${proj._id}`}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="project-emoji">{proj.icon || '🚀'}</span>
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.title}</span>
                            <button
                                onClick={(e) => handleTogglePin(e, proj._id)}
                                className="pin-btn"
                                title="Pin Project"
                            >
                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" /></svg>
                            </button>
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="user-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <p className="user-name">{user?.name}</p>
                        <p className="user-role">{user?.role}</p>
                    </div>
                </div>

                <button onClick={logout} className="logout-btn">
                    <img src="/logout.png" alt="Logout" className="nav-icon" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
