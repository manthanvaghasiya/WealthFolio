import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { 
  Plus, CheckCircle, Circle, Target, Calendar, 
  Wallet, TrendingUp, ArrowRight, Clock, IndianRupee, 
  Landmark, Banknote, Sparkles, CreditCard, X 
} from 'lucide-react'; // Added CreditCard, X
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Salary', 'Shopping', 'Health', 'Education', 'Investment'];

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User Name Retrieval
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Achiever' };
  const firstName = user.name.split(' ')[0]; 

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', type: 'expense', paymentMode: 'Bank' });
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [txRes, habitRes, goalRes] = await Promise.all([
        API.get('/transactions'),
        API.get('/habits'),
        API.get('/goals')
      ]);
      setTransactions(txRes.data);
      setHabits(habitRes.data);
      setGoals(goalRes.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  // --- LOGIC ---
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];
  const todayDateString = todayObj.toLocaleDateString(); 

  // 1. FILTER: Incomplete Habits Today
  const incompleteHabits = habits.filter(h => !h.completedDates.includes(todayStr));

  // 2. FILTER: Active Goals (Strictly Pending)
  const activeGoals = goals
    .filter(g => !g.isCompleted) 
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  // 3. FILTER: Today's Transactions
  const todayTransactions = transactions.filter(t => 
    new Date(t.date).toLocaleDateString() === todayDateString
  );

  // 4. SUMMARY STATS
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const totalInvested = transactions.filter(t => t.type === 'expense' && t.category === 'Investment').reduce((acc, c) => acc + c.amount, 0);
  const totalExpensesRaw = transactions.filter(t => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const totalRealExpenses = totalExpensesRaw - totalInvested;
  const balance = totalIncome - totalExpensesRaw;

  // BANK vs CASH BREAKDOWN
  const bankBalance = transactions.reduce((acc, t) => {
    if (t.paymentMode === 'Cash') return acc;
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const cashBalance = transactions.reduce((acc, t) => {
    if (t.paymentMode !== 'Cash') return acc;
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  // --- ACTIONS ---
  const handleToggleHabit = async (id) => {
    setHabits(prev => prev.map(h => h._id === id ? { ...h, completedDates: [...h.completedDates, todayStr] } : h));
    try { await API.put(`/habits/${id}/toggle`, { date: todayStr }); } catch (err) { fetchAllData(); }
  };

  const handleToggleGoal = async (id) => {
    setGoals(prev => prev.map(g => g._id === id ? { ...g, isCompleted: true } : g));
    try { await API.put(`/goals/${id}/toggle`); } catch (err) { fetchAllData(); }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const finalCategory = formData.category === 'Other' ? customCategory : formData.category;
    try {
        const res = await API.post('/transactions', { ...formData, category: finalCategory, date: new Date() });
        setTransactions([res.data, ...transactions]);
        setShowForm(false);
        setFormData({ title: '', amount: '', category: 'Food', type: 'expense', paymentMode: 'Bank' });
        setCustomCategory('');
    } catch (err) { alert('Error adding'); }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in bg-gray-50/50 min-h-screen">
      
      {/* 1. PREMIUM HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <div className="flex items-center gap-2">
                {/* Font weight reduced from extrabold to bold */}
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hello, {firstName}</h1>
                <span className="animate-pulse">👋</span>
            </div>
            <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Let's make today productive.
            </p>
        </div>
        
        {/* Button: Changed to Blue */}
        <button 
            onClick={() => setShowForm(true)} 
            className="group bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="bg-white/20 p-1 rounded-lg"><Plus className="w-4 h-4" /></div>
            Quick Spend
        </button>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Net Worth - RESTORED BLUE GRADIENT */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-2xl transition-transform hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
                  <h2 className="text-3xl font-bold flex items-center gap-1"><IndianRupee className="w-6 h-6 text-blue-200" /> {balance.toLocaleString()}</h2>
              </div>
              <div className="mt-6 pt-4 border-t border-white/20 flex justify-between text-xs font-medium text-blue-50">
                  <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Bank: {formatCurrency(bankBalance)}</span>
                  <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Cash: {formatCurrency(cashBalance)}</span>
              </div>
          </div>
        </div>
        
        {/* Income */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
             <div className="p-3 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-100 transition-colors"><TrendingUp className="w-6 h-6" /></div>
             <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-lg">+ Income</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Income</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalIncome)}</h2>
        </div>

        {/* Expenses - CHANGED ICON TO CREDIT CARD */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
             <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-100 transition-colors"><CreditCard className="w-6 h-6" /></div>
             <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-1 rounded-lg">- Expense</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Net Expenses</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRealExpenses)}</h2>
        </div>

        {/* Invested */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
             <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-100 transition-colors"><Target className="w-6 h-6" /></div>
             <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">Assets</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Invested</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalInvested)}</h2>
        </div>
      </div>

      {/* 3. MAIN SPLIT LAYOUT (50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* --- LEFT: HABITS --- */}
          <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col h-full min-h-[450px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
              
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-xl text-green-600"><CheckCircle className="w-5 h-5" /></div>
                      Daily Rituals
                  </h3>
                  <span className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-md">{incompleteHabits.length} Left</span>
              </div>
              
              <div className="p-5 space-y-4">
                  {incompleteHabits.length > 0 ? (
                      incompleteHabits.map(habit => (
                          <div key={habit._id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-green-200 hover:shadow-lg rounded-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5" onClick={() => handleToggleHabit(habit._id)}>
                              <div className="flex items-center gap-4">
                                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-green-500 flex items-center justify-center transition-colors">
                                      <div className="w-3 h-3 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </div>
                                  <span className="font-semibold text-gray-700 text-base group-hover:text-gray-900">{habit.title}</span>
                              </div>
                              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg group-hover:text-green-600 group-hover:bg-green-50 transition-colors">{habit.target} days</span>
                          </div>
                      ))
                  ) : (
                      <div className="py-16 text-center">
                          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                              <CheckCircle className="w-10 h-10 text-green-500" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">All Done For Today!</h4>
                          <p className="text-sm text-gray-500">You are unstoppable.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* --- RIGHT: GOALS & SPENDING --- */}
          <div className="flex flex-col gap-8">
              
              {/* BLOCK A: GOALS */}
              <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                  
                  <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-xl text-orange-600"><Target className="w-5 h-5" /></div>
                          Pending Goals
                      </h3>
                      <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-lg">{activeGoals.length}</span>
                  </div>

                  <div className="p-5 space-y-3">
                      {activeGoals.map(goal => {
                          const isOverdue = new Date(goal.deadline) < new Date().setHours(0,0,0,0);
                          return (
                              <div key={goal._id} className="p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-all bg-white flex justify-between items-center group">
                                  <div>
                                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{goal.title}</h4>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                                          {isOverdue ? 'Overdue' : formatDate(goal.deadline)}
                                      </span>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); handleToggleGoal(goal._id); }} className="text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 p-2 rounded-xl transition-all">
                                      <CheckCircle className="w-5 h-5" />
                                  </button>
                              </div>
                          );
                      })}
                      {activeGoals.length === 0 && <div className="py-8 text-center text-gray-400 text-sm font-medium italic">No active goals. Time to dream bigger.</div>}
                  </div>
              </div>

              {/* BLOCK B: SPENDING */}
              <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col flex-1 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>

                  <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><Clock className="w-5 h-5" /></div>
                          Today's Spending
                      </h3>
                  </div>

                  <div className="p-0">
                      {todayTransactions.length > 0 ? (
                          <ul className="divide-y divide-gray-50">
                              {todayTransactions.map(t => (
                                  <li key={t._id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-default">
                                      <div className="flex items-center gap-4">
                                          <div className={`p-2.5 rounded-xl ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                              {t.type === 'income' ? <TrendingUp className="w-4 h-4"/> : <Wallet className="w-4 h-4"/>}
                                          </div>
                                          <div>
                                              <p className="font-semibold text-sm text-gray-800">{t.title}</p>
                                              <div className="flex items-center gap-2 mt-0.5">
                                                  <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t.category}</span>
                                                  <span className="text-[10px] text-gray-400">• {t.paymentMode}</span>
                                              </div>
                                          </div>
                                      </div>
                                      <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                      </span>
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <div className="py-8 text-center text-gray-400 text-sm font-medium italic">No transactions recorded today.</div>
                      )}
                  </div>
              </div>

          </div>
      </div>

      {/* QUICK ADD MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative transform transition-all scale-100">
                <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition"><X className="w-5 h-5 text-gray-500" /></button>
                <h3 className="font-extrabold text-2xl mb-1 text-gray-900">Quick Spend</h3>
                <p className="text-gray-500 text-sm mb-6">Track it before you forget it.</p>
                
                <form onSubmit={handleQuickAdd} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Title</label>
                        <input type="text" placeholder="Coffee, Uber, etc." required className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black bg-gray-50 font-medium" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Amount</label>
                            <input type="number" placeholder="0.00" required className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black bg-gray-50 font-medium" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Source</label>
                            <select className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black bg-gray-50 font-medium appearance-none" 
                                value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})}>
                                <option value="Bank">Bank</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Category</label>
                        <select className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black bg-gray-50 font-medium appearance-none" 
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {formData.category === 'Other' && (
                        <input type="text" placeholder="Type Category Name" required className="w-full p-4 border border-blue-200 bg-blue-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-blue-800 font-bold" value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 p-4 rounded-2xl font-bold text-sm transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Expense</button>
                        <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 p-4 rounded-2xl font-bold text-sm transition-all ${formData.type === 'income' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Income</button>
                    </div>
                    
                    <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-black shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 mt-4">
                        Save Transaction
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;