import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Wallet, Sparkles } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left: Decorative */}
        <div className="w-full md:w-1/2 bg-gray-900 relative hidden md:flex flex-col justify-center items-center text-white p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600 opacity-20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Join the Club</h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-xs mx-auto">
                    Start your journey towards financial freedom and personal mastery today.
                </p>
            </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-8 md:hidden">
                <div className="p-2 bg-black rounded-xl text-white"><Wallet className="w-6 h-6" /></div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500 mb-8 font-medium">It only takes a minute to get started.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium transition-all"
                  placeholder="John Doe"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
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
              <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4">
                <UserPlus className="w-5 h-5" /> Sign Up
              </button>
            </form>
            
            <p className="text-center mt-8 text-gray-500 font-medium text-sm">
              Already have an account? <Link to="/login" className="text-gray-900 font-bold hover:underline">Log in</Link>
            </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;