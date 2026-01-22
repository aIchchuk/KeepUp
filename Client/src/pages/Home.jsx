import React from 'react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
                {/* Hero Section */}
                <div className="text-center space-y-8 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-4 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400"></span>
                        </span>
                        New: Template Marketplace now live
                    </div>

                    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                        Keep your focus, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            stay on track.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        A simple, powerful Notion-style task manager designed for clarity.
                        Organize your projects, buy templates, and level up your productivity.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button className="w-full sm:w-auto px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 transition-all shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:-translate-y-0.5 transform">
                            Start Building for Free
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Feature Preview (Dashboard Lite) */}
                <div className="mt-24 relative max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent rounded-[40px] blur-3xl pointer-events-none"></div>
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl shadow-black/40 overflow-hidden transform hover:-translate-y-1 transition-all duration-500 relative">
                        <div className="h-12 border-b border-white/5 px-6 flex items-center gap-2 bg-gray-800/30">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                            </div>
                            <div className="ml-4 h-6 w-48 bg-white/5 rounded-full"></div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div className="h-6 w-24 bg-white/10 rounded-md"></div>
                                    <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20 space-y-2">
                                        <div className="h-3 w-3/4 bg-violet-400/40 rounded-full"></div>
                                        <div className="h-3 w-1/2 bg-violet-400/20 rounded-full"></div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                                        <div className="h-3 w-2/3 bg-white/20 rounded-full"></div>
                                        <div className="h-3 w-1/3 bg-white/10 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-6 w-32 bg-white/10 rounded-md"></div>
                                    <div className="p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl shadow-lg shadow-violet-500/30 space-y-2">
                                        <div className="h-3 w-2/3 bg-white/40 rounded-full"></div>
                                        <div className="h-6 w-1/3 bg-white/20 rounded-md"></div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                                        <div className="h-3 w-3/4 bg-white/20 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-4 hidden md:block">
                                    <div className="h-6 w-20 bg-white/10 rounded-md"></div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                                        <div className="h-3 w-2/3 bg-white/20 rounded-full"></div>
                                        <div className="h-3 w-1/2 bg-white/10 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Feature Grid */}
            <section className="py-32 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4 p-8 rounded-[32px] hover:bg-white/5 transition-colors group backdrop-blur-sm">
                            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform border border-indigo-500/20">
                                📋
                            </div>
                            <h3 className="text-xl font-bold text-white">Tasks & Projects</h3>
                            <p className="text-gray-400 leading-relaxed">Clean, structured task management without the noise. Just results.</p>
                        </div>
                        <div className="space-y-4 p-8 rounded-[32px] hover:bg-white/5 transition-colors group backdrop-blur-sm">
                            <div className="w-14 h-14 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform border border-violet-500/20">
                                🔒
                            </div>
                            <h3 className="text-xl font-bold text-white">MFA & Security</h3>
                            <p className="text-gray-400 leading-relaxed">Bank-level security for your data. Your privacy is our priority.</p>
                        </div>
                        <div className="space-y-4 p-8 rounded-[32px] hover:bg-white/5 transition-colors group backdrop-blur-sm">
                            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform border border-amber-500/20">
                                💎
                            </div>
                            <h3 className="text-xl font-bold text-white">Marketplace</h3>
                            <p className="text-gray-400 leading-relaxed">Access premium templates or monetize your own workflows.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
                © 2026 KeepUp. All rights reserved.
            </footer>
        </div>
    );
};

export default Home;
