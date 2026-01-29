import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#0d1117] border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center text-lg font-bold
                          transition-transform duration-200 group-hover:scale-105">
                        K
                    </div>
                    <span className="text-xl font-semibold tracking-tight transition-colors group-hover:text-gray-200">
                        KeepUp
                    </span>
                </Link>

                {/* Center Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {["Features", "Templates", "Pricing"].map((item) => (
                        <Link
                            key={item}
                            to={`/${item.toLowerCase()}`}
                            className="relative text-base text-gray-400 hover:text-white transition-colors
                         after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0
                         after:bg-violet-500 after:transition-all after:duration-300
                         hover:after:w-full"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                {/* Right */}
                <div className="flex items-center gap-5">
                    {user ? (
                        <>
                            {/* Cart */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative text-gray-400 hover:text-white transition
                           hover:-translate-y-0.5 duration-200"
                            >
                                <span className="text-xl">🛒</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-violet-600 text-xs
                                   w-5 h-5 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Dashboard */}
                            <Link
                                to="/dashboard"
                                className="hidden sm:inline-block px-4 py-2 text-sm font-medium
                           rounded-md text-gray-300 hover:text-white
                           hover:bg-white/5 transition"
                            >
                                Dashboard
                            </Link>

                            {/* Profile */}
                            <Link
                                to="/profile"
                                className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center
                           text-sm font-medium transition-transform duration-200
                           hover:scale-105"
                            >
                                {user.name.charAt(0)}
                            </Link>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="hidden sm:block text-sm text-gray-400 hover:text-white transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-base text-gray-400 hover:text-white transition"
                            >
                                Sign in
                            </Link>

                            <Link
                                to="/register"
                                className="px-5 py-2.5 bg-violet-600 rounded-md text-base font-medium
                           hover:bg-violet-500 transition
                           hover:-translate-y-0.5"
                            >
                                Get started
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
