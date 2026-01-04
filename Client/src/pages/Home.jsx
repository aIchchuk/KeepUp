import React from 'react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 selection:bg-indigo-100 selection:text-indigo-700">
            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
                {/* Hero Section */}
                <div className="text-center space-y-8 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        New: Template Marketplace now live
                    </div>

                    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                        Keep your focus, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            stay on track.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        A simple, powerful Notion-style task manager designed for clarity.
                        Organize your projects, buy templates, and level up your productivity.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transform">
                            Start Building for Free
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Feature Preview (Dashboard Lite) */}
                <div className="mt-24 relative max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/50 rounded-[40px] pointer-events-none"></div>
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-indigo-100/50 overflow-hidden transform hover:-translate-y-1 transition-all duration-500">
                        <div className="h-12 border-b border-gray-50 px-6 flex items-center gap-2 bg-gray-50/30">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="ml-4 h-6 w-48 bg-gray-100 rounded-full"></div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div className="h-6 w-24 bg-gray-100 rounded-md"></div>
                                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-2">
                                        <div className="h-3 w-3/4 bg-indigo-200 rounded-full"></div>
                                        <div className="h-3 w-1/2 bg-indigo-200/50 rounded-full"></div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                        <div className="h-3 w-2/3 bg-gray-200 rounded-full"></div>
                                        <div className="h-3 w-1/3 bg-gray-200/50 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-6 w-32 bg-gray-100 rounded-md"></div>
                                    <div className="p-4 bg-violet-600 rounded-xl shadow-lg shadow-violet-200 space-y-2">
                                        <div className="h-3 w-2/3 bg-white/40 rounded-full"></div>
                                        <div className="h-6 w-1/3 bg-white/20 rounded-md"></div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                        <div className="h-3 w-3/4 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-4 hidden md:block">
                                    <div className="h-6 w-20 bg-gray-100 rounded-md"></div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                        <div className="h-3 w-2/3 bg-gray-200 rounded-full"></div>
                                        <div className="h-3 w-1/2 bg-gray-200/50 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Feature Grid */}
            <section className="bg-white py-32 border-t border-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4 p-8 rounded-[32px] hover:bg-gray-50 transition-colors group">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform">
                                📋
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Tasks & Projects</h3>
                            <p className="text-gray-500 leading-relaxed">Clean, structured task management without the noise. Just results.</p>
                        </div>
                        <div className="space-y-4 p-8 rounded-[32px] hover:bg-gray-50 transition-colors group">
                            <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform">
                                🔒
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">MFA & Security</h3>
                            <p className="text-gray-500 leading-relaxed">Bank-level security for your data. Your privacy is our priority.</p>
                        </div>
                        <div className="space-y-4 p-8 rounded-[32px] hover:bg-gray-50 transition-colors group">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform">
                                💎
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Marketplace</h3>
                            <p className="text-gray-500 leading-relaxed">Access premium templates or monetize your own workflows.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-sm bg-gray-50/50">
                © 2026 KeepUp. All rights reserved.
            </footer>
        </div>
    );
};

export default Home;
