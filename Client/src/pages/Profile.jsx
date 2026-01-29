import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../api/api';
import { getFullImageUrl } from '../api/imageUtils';
import '../styles/Profile.css';

const Profile = () => {
    const { user, toggleMfa, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const fileInputRef = useRef(null);

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

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/users/profile/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = { ...user, profilePicture: res.data.profilePicture };
            updateUser(updatedUser);
            setMessage('Profile image updated successfully');
        } catch (err) {
            console.error(err);
            setMessage('Failed to upload image');
        }
    };

    const handleUpdateProfile = async () => {
        if (!editName.trim()) return;
        setLoading(true);
        try {
            const res = await api.patch('/users/profile', { name: editName });
            updateUser(res.data);
            setIsEditing(false);
            setMessage('Profile updated successfully');
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ textAlign: 'center', padding: '100px' }}>Please log in to view your profile.</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-image-upload" onClick={handleImageClick}>
                        <div className="profile-avatar overflow-hidden">
                            {user.profilePicture ? (
                                <img src={getFullImageUrl(user.profilePicture)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                        <div className="upload-overlay">
                            <svg className="camera-icon" width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </div>

                    <div className="profile-info" style={{ flex: 1 }}>
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter your name"
                                    autoFocus
                                />
                                <Button onClick={handleUpdateProfile} disabled={loading} size="sm">Save</Button>
                                <Button variant="secondary" onClick={() => { setIsEditing(false); setEditName(user.name); }} size="sm">Cancel</Button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h1>{user.name}</h1>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 transition-colors"
                                    title="Edit Name"
                                    style={{ color: 'white' }}
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                            </div>
                        )}
                        <p className="profile-email">{user.email}</p>
                        <span className="profile-role">
                            {user.role}
                        </span>
                    </div>
                </div>

                <div className="profile-section">
                    <div style={{ marginBottom: '24px' }}>
                        <h2 className="section-title">Security Settings</h2>
                        <p className="section-desc">Manage your account protection and security boosters.</p>
                    </div>

                    <div className="security-box">
                        <div style={{ flex: 1 }}>
                            <div className="security-header">
                                <span className="security-label">Email Multi-Factor Authentication</span>
                                <span className={`security-badge ${user.mfaEnabled ? 'active' : 'inactive'}`}>
                                    {user.mfaEnabled ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="security-desc">
                                Protect your account by requiring a 6-digit code sent to your email whenever you log in.
                            </p>
                        </div>
                        <Button
                            variant={user.mfaEnabled ? 'danger' : 'primary'}
                            onClick={handleToggleMfa}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : user.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                        </Button>
                    </div>

                    {message && (
                        <div className={`status-message ${message.includes('success') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="profile-section">
                    <h2 className="section-title" style={{ marginBottom: '24px' }}>Account Details</h2>
                    <div className="details-grid">
                        <div className="detail-item">
                            <label className="detail-label">User ID</label>
                            <div className="detail-value">
                                {user.id || user._id}
                            </div>
                        </div>
                        <div className="detail-item">
                            <label className="detail-label">Member Since</label>
                            <div className="detail-value">
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
