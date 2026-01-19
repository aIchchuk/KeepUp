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

import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="antialiased text-gray-900 bg-gray-50 min-h-screen">
          <Routes>
            {/* Public Routes with Global Navbar */}
            <Route element={<><Navbar /><Home /></>} path="/" />
            <Route element={<><Navbar /><Login /></>} path="/login" />
            <Route element={<><Navbar /><Register /></>} path="/register" />
            <Route element={<><Navbar /><VerifyMfa /></>} path="/verify-mfa" />

            {/* Internal Dashboard Routes with Sidebar */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
