import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

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

    const navItems = [
        { name: 'Dashboard', icon: '/dashboard.png', path: '/dashboard' },
        { name: 'Marketplace', icon: '/shopping-cart.png', path: '/marketplace' },
        { name: 'Profile', icon: '/user.png', path: '/profile' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white/70 backdrop-blur-xl border-r border-white/20 flex flex-col z-[60]">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <span className="text-white font-bold text-2xl">K</span>
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        KeepUp
                    </span>
                </div>

                <div className="mt-8 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Quick Search..."
                        className="block w-full pl-10 pr-4 py-2 bg-gray-100/50 border-none rounded-xl text-xs font-bold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-[10px] font-black text-gray-300 border border-gray-200 px-1.5 py-0.5 rounded-md bg-white">Ctrl K</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="pt-2 pb-4">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">General</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-300 border border-transparent
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 border-indigo-400'
                                    : 'text-gray-500 hover:bg-white/50 hover:text-indigo-600 hover:border-white/80'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={item.icon}
                                        alt={item.name}
                                        className={`w-5 h-5 object-contain ${isActive ? 'brightness-0 invert' : ''}`}
                                    />
                                    <span className="text-sm">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="pt-6">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                        Projects
                        <button className="hover:text-indigo-600 transition-colors">+</button>
                    </p>
                    <div className="space-y-1">
                        {projects.map((proj) => (
                            <NavLink
                                key={proj._id}
                                to={`/projects/${proj._id}`}
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all duration-300
                                    ${isActive
                                        ? 'bg-gray-100 text-indigo-600'
                                        : 'text-gray-500 hover:bg-white/40 hover:text-indigo-600'}
                                `}
                            >
                                <span className="text-lg leading-none">{proj.icon || '🚀'}</span>
                                <span className="text-[13px] truncate flex-1 tracking-tight">{proj.title}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-50 space-y-4">
                <div className="bg-gray-50 rounded-[28px] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.role}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 text-gray-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300"
                >
                    <img src="/logout.png" alt="Logout" className="w-6 h-6 object-contain" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
