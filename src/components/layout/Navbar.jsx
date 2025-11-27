import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LayoutDashboard, ArrowRightLeft, TrendingUp, Target, CalendarCheck, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  // Get User Data from Local Storage (or default to John Doe)
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'John Doe' };

  // Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Helper for Active Link Styling
  const getLinkClass = (path) => {
    return location.pathname === path 
      ? "flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium transition-colors"
      : "flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors";
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      
      {/* 1. LOGO */}
      <Link to="/" className="flex items-center gap-2 text-blue-600 hover:opacity-80 transition">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <Wallet className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-800">WealthFolio</span>
      </Link>

      

      {/* 2. CENTER MENU */}
      <div className="hidden md:flex items-center gap-1">
        <Link to="/" className={getLinkClass('/')}>
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        
        <Link to="/transactions" className={getLinkClass('/transactions')}>
          <ArrowRightLeft className="w-4 h-4" />
          Transactions
        </Link>
        
        <Link to="/investments" className={getLinkClass('/investments')}>
          <TrendingUp className="w-4 h-4" />
          Investments
        </Link>
        
        <Link to="/goals" className={getLinkClass('/goals')}>
          <Target className="w-4 h-4" />
          Goals
        </Link>

        <Link to="/habits" className={getLinkClass('/habits')}>
         <CalendarCheck className="w-4 h-4" />
          Habits
        </Link>
      </div>

      {/* 3. USER PROFILE (Right Side) */}
      <div className="flex items-center gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'J'}
            </div>
            <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-700 leading-none">{user.name}</p>
                <p className="text-xs text-gray-500 mt-1">Full Stack Dev</p>
            </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          title="Logout">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;