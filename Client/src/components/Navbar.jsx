import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-white font-bold text-xl">K</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    KeepUp
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors">Features</a>
                <a href="#templates" className="text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors">Templates</a>
                <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-violet-400 transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <Link to="/dashboard" className="text-sm font-semibold text-gray-300 hover:text-violet-400 transition-colors px-4 py-2">
                            Dashboard
                        </Link>
                        <Link to="/marketplace" className="text-sm font-semibold text-gray-300 hover:text-violet-400 transition-colors px-4 py-2">
                            Marketplace
                        </Link>

                        <Link to="/profile" className="flex items-center gap-3 pr-4 border-l border-white/10 pl-4 hover:opacity-80 transition-opacity">

                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs uppercase border border-violet-500/30">
                                {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-200">{user.name}</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-gray-400 hover:text-red-400 transition-colors px-4 py-2"
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2">
                            Log in
                        </Link>
                        <Link to="/register" className="text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-full hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
