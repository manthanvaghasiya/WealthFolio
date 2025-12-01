import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wallet, LayoutDashboard, CalendarCheck, Target, 
  StickyNote, Menu, X, LogOut, TrendingUp 
} from 'lucide-react';

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

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Helper for Link Styles
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
      isActive 
        ? "bg-black text-white shadow-lg" 
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    }`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      
      <div className="px-6 py-3 flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-800">LifeOS</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className={getLinkClass('/')}>
            <LayoutDashboard className="w-4 h-4"/> Dashboard
          </Link>
          <Link to="/habits" className={getLinkClass('/habits')}>
            <CalendarCheck className="w-4 h-4"/> Habits
          </Link>
          <Link to="/transactions" className={getLinkClass('/transactions')}>
            <TrendingUp className="w-4 h-4"/> Finance
          </Link>
          <Link to="/goals" className={getLinkClass('/goals')}>
            <Target className="w-4 h-4"/> Goals
          </Link>
          <Link to="/notes" className={getLinkClass('/notes')}>
            <StickyNote className="w-4 h-4"/> Notes
          </Link>
        </div>

        {/* Right Side: User & Mobile Toggle */}
        <div className="flex items-center gap-4">
            
            {/* User Profile */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden lg:block">
                    <p className="text-xs text-gray-400 font-bold uppercase">Welcome</p>
                    <p className="text-sm font-bold text-gray-800 leading-none">{user.name}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
            </div>

            {/* Logout (Desktop) */}
            <button 
              onClick={handleLogout}
              className="hidden md:flex p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout">
              <LogOut className="w-5 h-5" />
            </button>

            {/* HAMBURGER BUTTON (Mobile) */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
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
                    <TrendingUp className="w-5 h-5" /> Finance
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

export default Navbar;