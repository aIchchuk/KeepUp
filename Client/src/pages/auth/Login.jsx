import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
                    <p className="text-gray-500">Log in to your KeepUp account</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Email address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none mt-4"
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
