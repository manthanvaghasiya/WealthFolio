import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Wallet, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the local API URL if you haven't deployed backend changes yet
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
      window.location.reload();
    } catch (err) {
      alert('Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left: Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-10">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                    <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">LifeOS</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-8 font-medium">Enter your details to access your command center.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Email</label>
                <input 
                  type="email" 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium transition-all"
                  placeholder="name@example.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Password</label>
                <input 
                  type="password" 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium transition-all"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <button className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-black shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4">
                <LogIn className="w-5 h-5" /> Login
              </button>
            </form>
            
            <p className="text-center mt-8 text-gray-500 font-medium text-sm">
              New here? <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">Create an account</Link>
            </p>
        </div>

        {/* Right: Decorative Image/Gradient */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 relative hidden md:flex flex-col justify-center items-center text-white p-12 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
                <div className="mb-6 inline-flex p-4 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                    <Sparkles className="w-8 h-8 text-yellow-300" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Design Your Life</h3>
                <p className="text-blue-100 text-lg leading-relaxed max-w-xs mx-auto opacity-90">
                    Track your habits, manage your wealth, and achieve your goals—all in one place.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Login;