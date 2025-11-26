import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  // Check if user is logged in (Is there a token in the browser?)
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        {isAuthenticated && <Navbar />} {/* Only show Navbar if logged in */}
        
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
          />
          <Route 
            path="/signup" 
            element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;