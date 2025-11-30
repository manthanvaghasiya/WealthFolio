import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, IndianRupee, Pencil, Trash2, ArrowRightLeft, X, TrendingUp, Wallet } from 'lucide-react';

// Import Components
import ExpenseBreakdown from '../components/dashboard/ExpenseBreakdown';
import FinancialAnalytics from '../components/dashboard/FinancialAnalytics';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton'; // Ensure you have this

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Salary', 'Shopping', 'Health', 'Education', 'Investment'];

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', type: 'expense' });
  const [customCategory, setCustomCategory] = useState('');
  
  // Custom Transaction Type State
  const [txType, setTxType] = useState('expense'); 

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions');
      setTransactions(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  // --- DYNAMIC CATEGORY LOGIC (The Fix) ---
  // 1. Get all categories currently used in your database
  const usedCategories = transactions.map(t => t.category);
  // 2. Merge Defaults + Used, remove duplicates using Set
  const availableCategories = [...new Set([...DEFAULT_CATEGORIES, ...usedCategories])];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalType = txType;
    let finalCategory = formData.category;

    if (txType === 'investment') {
        finalType = 'expense';
        finalCategory = 'Investment';
    } else if (finalCategory === 'Other') {
        // Use the manual input
        finalCategory = customCategory; 
    }

    const dataToSend = { 
        ...formData, 
        type: finalType,
        category: finalCategory
    };

    try {
      if (editId) {
        const res = await API.put(`/transactions/${editId}`, dataToSend);
        setTransactions(transactions.map(t => t._id === editId ? res.data : t));
      } else {
        const res = await API.post('/transactions', dataToSend);
        setTransactions([res.data, ...transactions]);
      }
      closeForm();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    
    // Check if category is in our dynamic list
    const isStandard = availableCategories.includes(t.category);
    
    let uiType = t.type;
    if (t.category === 'Investment') uiType = 'investment';

    setTxType(uiType);
    setFormData({ title: t.title, amount: t.amount, category: isStandard ? t.category : 'Other', type: t.type });
    
    if (!isStandard) setCustomCategory(t.category);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditId(null);
    setFormData({ title: '', amount: '', category: 'Food', type: 'expense' });
    setTxType('expense');
    setCustomCategory('');
  };

  // --- SMART CALCULATIONS ---
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  
  const totalInvested = transactions
    .filter(t => t.type === 'expense' && t.category === 'Investment')
    .reduce((acc, c) => acc + c.amount, 0);

  const totalExpensesRaw = transactions.filter(t => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const totalRealExpenses = totalExpensesRaw - totalInvested;

  const balance = totalIncome - totalExpensesRaw;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>
            <p className="text-gray-500 text-sm">Overview of your current financial status.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200">
            <Plus className="w-5 h-5" /> Add Transaction
        </button>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold flex items-center"><IndianRupee className="w-6 h-6 mr-1" /> {balance}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Total Income</p>
          <h2 className="text-2xl font-bold text-green-600 flex items-center">+ <IndianRupee className="w-5 h-5" /> {totalIncome}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Total Expenses</p>
          <h2 className="text-2xl font-bold text-red-600 flex items-center">- <IndianRupee className="w-5 h-5" /> {totalRealExpenses}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-gray-500 text-sm mb-1">Total Invested</p>
                <h2 className="text-2xl font-bold text-purple-600 flex items-center">
                    <IndianRupee className="w-5 h-5" /> {totalInvested}
                </h2>
             </div>
             <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
             </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-full">
            <FinancialAnalytics transactions={transactions} />
        </div>
        <div className="lg:col-span-1 h-full">
            <ExpenseBreakdown transactions={transactions} />
        </div>
      </div>

      {/* 4. RECENT TRANSACTIONS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-gray-500" /> Recent Transactions
            </h3>
        </div>
        <ul>
            {transactions.map((t) => (
                <li key={t._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                    <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${t.category === 'Investment' ? 'bg-purple-500' : (t.type === 'income' ? 'bg-green-500' : 'bg-red-500')}`}></div>
                        <div>
                            <p className="font-semibold text-gray-800">{t.title}</p>
                            <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'} ₹{t.amount}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                </li>
            ))}
            {transactions.length === 0 && <div className="p-8 text-center text-gray-400">No transactions found.</div>}
        </ul>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button onClick={closeForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold mb-6">{editId ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" required className="w-full p-2 border border-gray-300 rounded-lg outline-none" 
                            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input type="number" required className="w-full p-2 border border-gray-300 rounded-lg outline-none" 
                                value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                             <select className="w-full p-2 border border-gray-300 rounded-lg outline-none" 
                                value={txType} onChange={(e) => setTxType(e.target.value)}>
                                <option value="income">Income (+)</option>
                                <option value="expense">Expense (-)</option>
                                <option value="investment">Investment (Asset)</option>
                             </select>
                        </div>
                    </div>
                    
                    {/* DYNAMIC CATEGORY DROPDOWN */}
                    {txType !== 'investment' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select className="w-full p-2 border border-gray-300 rounded-lg outline-none mb-2" 
                                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                {/* Map over AVAILABLE categories (Defaults + History) */}
                                {availableCategories.filter(c => c !== 'Investment').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="Other">Other (Type manually)</option>
                            </select>
                            
                            {formData.category === 'Other' && (
                                <input type="text" placeholder="Type custom category..." required className="w-full p-2 border border-blue-300 bg-blue-50 rounded-lg outline-none"
                                    value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
                            )}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                        {editId ? 'Update' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;