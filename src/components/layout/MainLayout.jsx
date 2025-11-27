// File: src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* The Navbar stays here permanently */}
      <Navbar />
      
      {/* "main" adds padding/margins for all pages automatically */}
      <main>
        {/* <Outlet /> is a placeholder where child routes (Dashboard, etc.) appear */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;