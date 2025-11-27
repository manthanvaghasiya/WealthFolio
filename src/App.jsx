import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Habits from './pages/Habits';
// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import Goals from './pages/Goals';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES (No Navbar) */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />

        {/* PROTECTED ROUTES (Wrapped in MainLayout) */}
        {/* If authenticated, use MainLayout. If not, redirect to Login. */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/habits" element={<Habits />} />
        </Route>

        {/* Catch all 404s -> redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;