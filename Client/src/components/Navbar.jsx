import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-xl">K</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight group-hover:text-gray-200 transition-colors">
                        KeepUp
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
                    <a href="#templates" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Templates</a>
                    <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</a>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <Link to="/marketplace" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Marketplace
                            </Link>

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0d1117]">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

                            <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-semibold text-xs border border-white/10">
                                    {user.name.charAt(0)}
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2">
                                Sign In
                            </Link>
                            <Link to="/register" className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/5">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </nav>
    );
};

export default Navbar;
