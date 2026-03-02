// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import './App.css';
function App() {
  return (
    <Router>
      <Routes>
        {/* Route 1: The Landing Page (Redirect to Login for now) */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Route 2: Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Route 3: Register Page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Route 4: Dashboard (We will protect this later) */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;