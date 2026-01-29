import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="relative min-h-screen bg-[#0d1117] text-white overflow-hidden">

            {/* Subtle background accent */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-3xl" />
            </div>

            <main className="relative max-w-6xl mx-auto px-6 py-28">

                {/* Hero */}
                <section className="max-w-3xl mx-auto text-center space-y-7">
                    <span className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full bg-violet-600/10 text-violet-300 border border-violet-600/20">
                        ● Marketplace v2.0
                    </span>

                    <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
                        Stay focused.
                        <br />
                        <span className="text-gray-300">Build momentum.</span>
                    </h1>

                    <p className="text-gray-400 text-lg leading-relaxed">
                        KeepUp helps you organize tasks, notes, and projects in one
                        calm workspace designed for deep focus.
                    </p>

                    <div className="flex justify-center gap-4 pt-6">
                        <Link
                            to="/register"
                            className="px-6 py-3 bg-violet-600 rounded-md font-medium hover:bg-violet-500 transition"
                        >
                            Get started
                        </Link>
                        <Link
                            to="/login"
                            className="px-6 py-3 border border-white/10 rounded-md text-gray-300 hover:text-white"
                        >
                            View demo
                        </Link>
                    </div>
                </section>

                {/* Divider */}
                <div className="my-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Features */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Task Management",
                            desc: "Organize work with clean boards and workflows that scale."
                        },
                        {
                            title: "Security First",
                            desc: "MFA, encryption, and privacy-first infrastructure."
                        },
                        {
                            title: "Template Marketplace",
                            desc: "Reusable workflows built by productivity experts."
                        }
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="p-8 rounded-xl bg-[#161b22] border border-white/10"
                        >
                            <div className="w-10 h-10 mb-4 rounded-md bg-violet-600/15 text-violet-400 flex items-center justify-center font-semibold">
                                {i + 1}
                            </div>

                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </section>
            </main>

            <footer className="border-t border-white/10 py-10 text-center text-gray-500 text-sm">
                © 2026 KeepUp Inc.
            </footer>
        </div>
    );
};

export default Home;
