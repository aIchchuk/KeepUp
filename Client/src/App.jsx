import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyMfa from './pages/auth/VerifyMfa';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import PaymentResult from './pages/PaymentResult';
import OWASPRisk from './pages/documentation/OWASPRisk';
import ServerDependencies from './pages/documentation/ServerDependencies';
import ClientDependencies from './pages/documentation/ClientDependencies';
import DocsHome from './pages/documentation/DocsHome';
import RiskDetail from './pages/documentation/RiskDetail';
import Abbreviations from './pages/documentation/Abbreviations';


import './App.css';

import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-root">
            <Routes>
              {/* Public Routes with Global Navbar */}
              <Route element={<><Navbar /><Home /></>} path="/" />
              <Route element={<><Navbar /><Login /></>} path="/login" />
              <Route element={<><Navbar /><Register /></>} path="/register" />
              <Route element={<><Navbar /><VerifyMfa /></>} path="/verify-mfa" />
              <Route element={<PaymentResult />} path="/payment/callback" />
              <Route element={<DocsHome />} path="/docs" />
              <Route element={<OWASPRisk />} path="/docs/OWASPrisk" />
              <Route element={<RiskDetail />} path="/docs/OWASPrisk/:id" />
              <Route element={<ServerDependencies />} path="/docs/server-side-dependencies" />
              <Route element={<ClientDependencies />} path="/docs/client-side-dependencies" />
              <Route element={<Abbreviations />} path="/docs/abbreviations" />

              {/* Internal Dashboard Routes with Sidebar */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
