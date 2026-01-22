import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Potentially fetch user profile here to verify token
            api.get('/users/profile')
                .then(res => {
                    setUser(res.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/users/login', { email, password });
        if (res.data.mfaRequired) {
            return res.data;
        }
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const verifyMfa = async (email, code) => {
        const res = await api.post('/users/verify-mfa', { email, code });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const toggleMfa = async () => {
        const res = await api.post('/users/toggle-mfa');
        // Refresh user profile to get updated mfaEnabled state
        const profileRes = await api.get('/users/profile');
        setUser(profileRes.data);
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await api.post('/users/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, verifyMfa, toggleMfa, loading, updateUser: setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
