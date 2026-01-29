import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-[#0d1117] text-white selection:bg-violet-500/30 font-sans">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto space-y-8">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner shadow-white/5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
                        </span>
                        <span className="text-sm font-medium text-violet-200">Marketplace Live 2.0</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-white drop-shadow-lg">
                        Keep your focus, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            stay on track.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        The all-in-one workspace for your tasks, notes, and projects.
                        Simple enough for personal use, powerful enough for teams.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl shadow-white/10">
                            Start for free
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-sm">
                            Live Demo
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
                    {/* Feature 1 */}
                    <div className="p-8 rounded-3xl bg-[#161b22]/50 border border-white/5 backdrop-blur-sm hover:border-violet-500/30 transition-colors group">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Project Management</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Intuitive boards and lists to organize your tasks. Drag, drop, and done.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-3xl bg-[#161b22]/50 border border-white/5 backdrop-blur-sm hover:border-fuchsia-500/30 transition-colors group">
                        <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Bank-grade encryption, MFA, and OWASP-compliant security protocols.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-3xl bg-[#161b22]/50 border border-white/5 backdrop-blur-sm hover:border-amber-500/30 transition-colors group">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">💎</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Marketplace</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Buy and sell premium templates. Monetize your productivity workflow.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 text-center text-gray-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© 2026 KeepUp Inc.</p>
                    <div className="flex gap-6">
                        <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
                        <Link to="/docs/abbreviations" className="hover:text-white transition-colors">Glossary</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
