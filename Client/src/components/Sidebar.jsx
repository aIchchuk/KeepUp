import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', icon: '/dashboard.png', path: '/dashboard' },
        { name: 'Marketplace', icon: '/shopping-cart.png', path: '/marketplace' },
        { name: 'Profile', icon: '/account.png', path: '/profile' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-[60]">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <span className="text-white font-bold text-2xl">K</span>
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        KeepUp
                    </span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300
                            ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <img
                                    src={item.icon}
                                    alt={item.name}
                                    className={`w-6 h-6 object-contain ${isActive ? 'brightness-0 invert' : ''}`}
                                />
                                <span>{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
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
