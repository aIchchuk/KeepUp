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
        <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                    <span className="text-white font-bold text-xl">K</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    KeepUp
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
                <a href="#templates" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Templates</a>
                <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-4 py-2"
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">
                            Log in
                        </Link>
                        <Link to="/register" className="text-sm font-medium bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
