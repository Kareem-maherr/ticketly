import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Client from './pages/Client';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="w-full h-full">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/client" element={<Client />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
