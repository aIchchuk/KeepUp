import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 bg-[#0d1117]">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md bg-[#161b22]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-gray-400 text-sm">Join the productivity revolution</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? 'Creating...' : 'Get Started'}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-gray-800">
                    <p className="text-gray-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
