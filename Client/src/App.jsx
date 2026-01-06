import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyMfa from './pages/auth/VerifyMfa';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Marketplace from './pages/Marketplace';


import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="antialiased font-sans text-gray-900 bg-gray-50 min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-mfa" element={<VerifyMfa />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/marketplace" element={<Marketplace />} />


          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
