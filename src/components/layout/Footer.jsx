import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Github, Linkedin, Instagram, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* MAIN ROW: Brand & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/20 hover:scale-105 transition-transform">
                    <Wallet className="w-5 h-5" />
                </Link>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-white tracking-tight leading-tight">LifeOS</span>
                    <span className="text-[10px] text-gray-500 font-medium">Design your life.</span>
                </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
                <SocialLink href="https://github.com/manthanvaghasiya" icon={<Github className="w-4 h-4" />} />
                <SocialLink href="https://www.linkedin.com/in/manthan-vaghasiya-b213a8267" icon={<Linkedin className="w-4 h-4" />} color="hover:text-blue-400" />
                <SocialLink href="https://www.instagram.com/manthan_vaghasiya_07" icon={<Instagram className="w-4 h-4" />} color="hover:text-pink-500" />
            </div>
        </div>

        {/* BOTTOM ROW: Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
            <p className="text-gray-600">© {currentYear} LifeOS. All rights reserved.</p>
            
            <div className="flex items-center gap-1.5 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800/50">
                <span>Made with</span>
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                <span>by <span className="text-white">Manthan</span></span>
            </div>
        </div>

      </div>
    </footer>
  );
};

// Compact Social Button
const SocialLink = ({ href, icon, color = "hover:text-white" }) => (
    <a 
        href={href} 
        target="_blank" 
        rel="noreferrer" 
        className={`p-2 bg-gray-900 rounded-lg border border-gray-800 transition-all duration-200 hover:border-gray-700 ${color}`}
    >
        {icon}
    </a>
);

export default Footer;