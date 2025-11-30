import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, LayoutDashboard, ArrowRightLeft, CalendarCheck, Target, LogOut, StickyNote, Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get User Data
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Close menu when a link is clicked (UX best practice)
  const closeMenu = () => setIsMobileMenuOpen(false);

  // Helper for Link Styles
  const getLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200";
    const activeClass = "bg-blue-50 text-blue-600 shadow-sm";
    const inactiveClass = "text-gray-500 hover:bg-gray-50 hover:text-gray-900";
    
    return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      
      {/* 1. TOP BAR (Always Visible) */}
      <div className="px-6 py-3 flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-blue-600 hover:opacity-80 transition" onClick={closeMenu}>
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-800">LifeOS</span>
        </Link>

        {/* Desktop Menu (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" icon={<LayoutDashboard className="w-4 h-4"/>} text="Dashboard" active={location.pathname === '/'} />
          <NavLink to="/habits" icon={<CalendarCheck className="w-4 h-4"/>} text="Habits" active={location.pathname === '/habits'} />
          <NavLink to="/transactions" icon={<ArrowRightLeft className="w-4 h-4"/>} text="Transactions" active={location.pathname === '/transactions'} />
          <NavLink to="/goals" icon={<Target className="w-4 h-4"/>} text="Goals" active={location.pathname === '/goals'} />
          <NavLink to="/notes" icon={<StickyNote className="w-4 h-4"/>} text="Notes" active={location.pathname === '/notes'} />
        </div>

        {/* Right Side: User & Mobile Toggle */}
        <div className="flex items-center gap-4">
            
            {/* User Profile (Hidden on super small screens to save space) */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block">
                    <p className="text-sm font-bold text-gray-700 leading-none">{user.name}</p>
                </div>
            </div>

            {/* Logout (Desktop) */}
            <button 
              onClick={handleLogout}
              className="hidden md:flex p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Logout">
              <LogOut className="w-5 h-5" />
            </button>

            {/* HAMBURGER BUTTON (Mobile Only) */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* 2. MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-xl animate-slideDown">
            <div className="p-4 space-y-2">
                <Link to="/" className={getLinkClass('/')} onClick={closeMenu}>
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                </Link>
                <Link to="/habits" className={getLinkClass('/habits')} onClick={closeMenu}>
                    <CalendarCheck className="w-5 h-5" /> Habits
                </Link>
                <Link to="/transactions" className={getLinkClass('/transactions')} onClick={closeMenu}>
                    <ArrowRightLeft className="w-5 h-5" /> Transactions
                </Link>
                <Link to="/goals" className={getLinkClass('/goals')} onClick={closeMenu}>
                    <Target className="w-5 h-5" /> Goals
                </Link>
                <Link to="/notes" className={getLinkClass('/notes')} onClick={closeMenu}>
                    <StickyNote className="w-5 h-5" /> Notes
                </Link>
                
                <div className="border-t border-gray-100 my-2 pt-2">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </div>
        </div>
      )}
    </nav>
  );
};

// Small Helper Component for Desktop Links to keep code clean
const NavLink = ({ to, icon, text, active }) => (
    <Link to={to} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${active ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
        {icon} {text}
    </Link>
);

export default Navbar;