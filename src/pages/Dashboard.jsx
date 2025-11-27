import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, TrendingUp, TrendingDown, IndianRupee, Trash2, X, Pencil } from 'lucide-react';

// --- STANDARD CATEGORIES LIST ---
const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Salary', 'Shopping', 'Investment'];

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    type: 'expense'
  });

  // --- NEW: State for Custom Category Input ---
  const [customCategory, setCustomCategory] = useState('');

  // Helper: Get Token
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // ⚠️ MAKE SURE THIS URL IS YOUR RENDER URL
      const res = await axios.get('https://wealthfolio-api.onrender.com/api/transactions', getHeaders());
      setTransactions(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data", err);
      if(err.response?.status === 401) {
         localStorage.removeItem('token');
         window.location.href = '/login';
      }
      setLoading(false);
    }
  };

  // --- HANDLE SUBMIT (With Custom Category Logic) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare the data to send
    const dataToSend = { ...formData };
    
    // If user selected "Other", use the typed custom category instead
    if (formData.category === 'Other') {
        dataToSend.category = customCategory;
    }

    try {
      if (editId) {
        await axios.put(`https://wealthfolio-api.onrender.com/api/transactions/${editId}`, dataToSend, getHeaders());
      } else {
        await axios.post('https://wealthfolio-api.onrender.com/api/transactions', dataToSend, getHeaders());
      }
      
      closeForm();
      fetchTransactions();
    } catch (err) {
      console.error("Error saving transaction", err);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`https://wealthfolio-api.onrender.com/api/transactions/${id}`, getHeaders());
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting", err);
    }
  };

  // --- HANDLE EDIT (Detects if category is Custom) ---
  const handleEdit = (transaction) => {
    setEditId(transaction._id);
    
    // Check if the transaction's category is in our standard list
    const isStandardCategory = DEFAULT_CATEGORIES.includes(transaction.category);

    if (isStandardCategory) {
        // It's a normal category
        setFormData({
            title: transaction.title,
            amount: transaction.amount,
            category: transaction.category,
            type: transaction.type
        });
        setCustomCategory(''); // Clear custom input
    } else {
        // It's a custom category (e.g. "Gym")
        setFormData({
            title: transaction.title,
            amount: transaction.amount,
            category: 'Other', // Select "Other" in dropdown
            type: transaction.type
        });
        setCustomCategory(transaction.category); // Fill the text box
    }
    
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ title: '', amount: '', category: 'Food', type: 'expense' });
    setCustomCategory(''); // Reset custom input
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      const found = acc.find(item => item.name === curr.category);
      if (found) found.value += curr.amount;
      else acc.push({ name: curr.category, value: curr.amount });
      return acc;
    }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your finance data...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
      
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <h2 className="text-2xl font-bold text-red-600 flex items-center">- <IndianRupee className="w-5 h-5" /> {totalExpense}</h2>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Expense Analysis</h3>
          <div className="h-64 w-full">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
             ) : <div className="h-full flex items-center justify-center text-gray-400">No expense data yet</div>}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-white rounded-full shadow-sm text-blue-600"><Plus className="w-8 h-8" /></div>
            <div>
                <h3 className="text-lg font-bold text-gray-800">Add Transaction</h3>
                <p className="text-sm text-gray-500">Track a new income or expense</p>
            </div>
            <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition w-full">Add New</button>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
        </div>
        <ul>
            {transactions.map((t) => (
                <li key={t._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                    <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                            <p className="font-semibold text-gray-800">{t.title}</p>
                            <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'} ₹{t.amount}
                        </span>
                        <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </li>
            ))}
        </ul>
      </div>

      {/* POPUP FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                <option value="income">Income (+)</option>
                                <option value="expense">Expense (-)</option>
                             </select>
                        </div>
                    </div>
                    
                    {/* CATEGORY DROPDOWN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select className="w-full p-2 border border-gray-300 rounded-lg outline-none mb-2" 
                            value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                            
                            {/* Standard Options */}
                            {DEFAULT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                            
                            {/* Other Option */}
                            <option value="Other">Other (Type manually)</option>
                        </select>

                        {/* NEW: Input appears only if "Other" is selected */}
                        {formData.category === 'Other' && (
                            <input 
                                type="text" 
                                placeholder="Type your custom category..." 
                                required
                                className="w-full p-2 border border-blue-300 bg-blue-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={customCategory} 
                                onChange={(e) => setCustomCategory(e.target.value)} 
                            />
                        )}
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                        {editId ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;