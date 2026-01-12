import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerifyMfa = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { verifyMfa } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    if (!email) {
        navigate('/login');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyMfa(email, code);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid MFA code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4">
                        📧
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Verify your email</h2>
                    <p className="text-gray-500 text-sm">
                        We've sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span>.
                        The code expires in 10 minutes.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1 text-center">
                        <label className="text-sm font-semibold text-gray-700">6-Digit Code</label>
                        <input
                            type="text"
                            required
                            maxLength="6"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-center text-2xl font-bold tracking-[0.5em] placeholder:text-gray-300"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none mt-4"
                    >
                        {loading ? 'Verifying...' : 'Verify & Log in'}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
                    >
                        ← Back to login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyMfa;
