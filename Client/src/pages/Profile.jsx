import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, toggleMfa } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleToggleMfa = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await toggleMfa();
            setMessage(res.message);
        } catch (err) {
            setMessage('Failed to update MFA settings');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="text-center py-20">Please log in to view your profile.</div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl p-8 md:p-12 space-y-12">
                {/* Header */}
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-4xl text-indigo-700 font-bold uppercase">
                        {user.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-500">{user.email}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* Security Section */}
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                        <p className="text-gray-500 text-sm">Manage your account protection and security boosters.</p>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">Email Multi-Factor Authentication</span>
                                {user.mfaEnabled ? (
                                    <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">Active</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 max-w-md">
                                Protect your account by requiring a 6-digit code sent to your email whenever you log in.
                            </p>
                        </div>
                        <button
                            onClick={handleToggleMfa}
                            disabled={loading}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${user.mfaEnabled
                                    ? 'bg-white text-red-600 border border-red-100 hover:bg-red-50'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                                }`}
                        >
                            {loading ? 'Processing...' : user.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                        </button>
                    </div>

                    {message && (
                        <div className={`text-sm font-medium px-4 py-2 rounded-lg text-center ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Account Details */}
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Account Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">User ID</label>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 font-mono overflow-x-auto">
                                {user.id || user._id}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Member Since</label>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600">
                                {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
