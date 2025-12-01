import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import Papa from 'papaparse';
import {
  Plus, Search, Download, Filter, ChevronLeft, ChevronRight, Pencil, Trash2, Save, X,
  TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Landmark, Banknote, Calendar, ArrowRight,
  CreditCard, PieChart, Sparkles, SlidersHorizontal, IndianRupee
} from 'lucide-react';
import ExpenseBreakdown from '../components/dashboard/ExpenseBreakdown';
import FinancialAnalytics from '../components/dashboard/FinancialAnalytics';

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Salary', 'Shopping', 'Health', 'Education', 'Investment'];

const Financial = () => {
  const [allTransactions, setAllTransactions] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // VIEW STATE
  const [viewDate, setViewDate] = useState(new Date());

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [txType, setTxType] = useState('expense');
  const [formData, setFormData] = useState({ title: '', amount: '', paymentMode: 'Bank', transferTo: 'Cash', category: 'Food' });
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions');
      setAllTransactions(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  // --- DATA LOGIC ---
  const currentMonthTransactions = allTransactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === viewDate.getMonth() && tDate.getFullYear() === viewDate.getFullYear();
  });

  const calculateTotalBalance = (mode) => {
    return allTransactions.reduce((acc, t) => {
      if (t.paymentMode === mode && t.type === 'income') return acc + t.amount;
      if (t.paymentMode === mode && t.type === 'expense') return acc - t.amount;
      if (t.paymentMode === mode && t.type === 'transfer') return acc - t.amount;
      if (t.type === 'transfer' && t.category === mode) return acc + t.amount;
      return acc;
    }, 0);
  };
  const bankBalance = calculateTotalBalance('Bank');
  const cashBalance = calculateTotalBalance('Cash');
  const investmentBalance = calculateTotalBalance('Investment');
  const totalNetWorth = bankBalance + cashBalance + investmentBalance;

  const monthlyIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const monthlyInvested = currentMonthTransactions.filter(t => t.type === 'expense' && t.category === 'Investment').reduce((acc, c) => acc + c.amount, 0);
  const monthlyExpenses = currentMonthTransactions.filter(t => t.type === 'expense' && t.category !== 'Investment').reduce((acc, c) => acc + c.amount, 0);

  const handlePrevMonth = () => { setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); setCurrentPage(1); };
  const handleNextMonth = () => { setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); setCurrentPage(1); };
  const formattedMonth = viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalCategory = txType === 'transfer' ? formData.transferTo : (formData.category === 'Other' ? customCategory : formData.category);
    let finalTitle = txType === 'transfer' ? `Transfer to ${formData.transferTo}` : formData.title;

    const finalData = {
      title: finalTitle,
      amount: Number(formData.amount),
      type: txType,
      category: finalCategory,
      paymentMode: formData.paymentMode,
      date: new Date()
    };

    try {
      if (editId) {
        const res = await API.put(`/transactions/${editId}`, finalData);
        setAllTransactions(allTransactions.map(t => t._id === editId ? res.data : t));
      } else {
        const res = await API.post('/transactions', finalData);
        setAllTransactions([res.data, ...allTransactions]);
      }
      closeForm();
    } catch (err) { alert("Error saving"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete transaction?")) return;
    try { await API.delete(`/transactions/${id}`); setAllTransactions(allTransactions.filter(t => t._id !== id)); } catch (err) {}
  };

  const openEdit = (t) => {
    setEditId(t._id);
    setTxType(t.type);
    const isTransfer = t.type === 'transfer';
    const isStandard = DEFAULT_CATEGORIES.includes(t.category);

    setFormData({
      title: t.title,
      amount: t.amount,
      paymentMode: t.paymentMode,
      transferTo: isTransfer ? t.category : 'Cash',
      category: !isTransfer && isStandard ? t.category : 'Other'
    });
    if (!isTransfer && !isStandard) setCustomCategory(t.category);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditId(null);
    setFormData({ title: '', amount: '', category: 'Food', paymentMode: 'Bank', transferTo: 'Cash' });
    setTxType('expense'); setCustomCategory('');
  };

  const handleExport = () => {
    const csvData = currentMonthTransactions.map(t => ({
      Date: formatDate(t.date),
      Title: t.title,
      Category: t.category,
      Type: t.type.toUpperCase(),
      Source: t.paymentMode,
      Amount: t.amount
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.setAttribute('download', `LifeOS_${formattedMonth}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredData = currentMonthTransactions
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => sortOrder === 'newest' ? new Date(b.date) - new Date(a.date) : b.amount - a.amount);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading your finances...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
        
        {/* 1. HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                {/* Fixed Font Weight */}
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    Financial Overview <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-200 animate-pulse" />
                </h1>
                <p className="text-gray-500 font-medium mt-2 text-lg">Your wealth command center.</p>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-2xl shadow-sm border border-gray-200/60">
                    <button onClick={handlePrevMonth} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition"><ChevronLeft className="w-4 h-4"/></button>
                    <div className="flex items-center gap-2 px-2 min-w-[130px] justify-center">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-gray-800 text-sm">{formattedMonth}</span>
                    </div>
                    <button onClick={handleNextMonth} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition"><ChevronRight className="w-4 h-4"/></button>
                </div>

                <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl font-bold hover:bg-gray-50 transition shadow-sm text-sm">
                    <Download className="w-4 h-4" /> CSV
                </button>
                <button onClick={() => setShowForm(true)} className="group flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-sm">
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Add New
                </button>
            </div>
        </div>

        {/* 2. SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Net Worth */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200/50 transition-transform hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl opacity-10 -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">Total Net Worth</p>
                        {/* Fixed Font Weight */}
                        <h2 className="text-4xl font-bold flex items-center gap-1"><IndianRupee className="w-8 h-8 text-blue-300" /> {totalNetWorth.toLocaleString()}</h2>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between text-xs font-semibold text-blue-50">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Bank: {formatCurrency(bankBalance)}</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400"></div> Cash: {formatCurrency(cashBalance)}</span>
                    </div>
                </div>
            </div>
            
            {/* Income */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-100 transition-colors"><TrendingUp className="w-7 h-7" /></div>
                    <span className="text-[10px] font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full uppercase tracking-wide">{formattedMonth}</span>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Income</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">+ {formatCurrency(monthlyIncome)}</h2>
            </div>

            {/* Expenses */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-100 transition-colors"><CreditCard className="w-7 h-7" /></div>
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 px-3 py-1 rounded-full uppercase tracking-wide">{formattedMonth}</span>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Net Expenses</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">- {formatCurrency(monthlyExpenses)}</h2>
            </div>

            {/* Invested */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-100 transition-colors"><PieChart className="w-7 h-7" /></div>
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full uppercase tracking-wide">Assets</span>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Invested</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(investmentBalance)}</h2>
            </div>
        </div>

        {/* 3. CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 min-h-[350px]"><FinancialAnalytics transactions={currentMonthTransactions} /></div>
            <div className="lg:col-span-1 min-h-[350px]"><ExpenseBreakdown transactions={currentMonthTransactions} /></div>
        </div>

        {/* 4. TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center bg-white">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={`Search ${formattedMonth}...`} 
                        className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 font-bold transition-all placeholder-gray-400" 
                        value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl cursor-pointer hover:bg-gray-100 transition group">
                        <SlidersHorizontal className="w-4 h-4 text-gray-500 group-hover:text-gray-800" />
                        <select className="bg-transparent outline-none text-sm font-bold text-gray-600 cursor-pointer w-full" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
                            <option value="all">All Types</option>
                            <option value="income">Incomes Only</option>
                            <option value="expense">Expenses Only</option>
                            <option value="transfer">Transfers Only</option>
                        </select>
                    </div>
                    <select className="px-5 py-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Amount</option>
                        <option value="lowest">Lowest Amount</option>
                    </select>
                </div>
            </div>
            
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <th className="p-6 pl-10">Date</th>
                        <th className="p-6">Title</th>
                        <th className="p-6">Details</th>
                        <th className="p-6">Amount</th>
                        <th className="p-6 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-medium">
                {paginatedData.map(t => (
                    <tr key={t._id} className="group border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                        <td className="p-6 pl-10 text-gray-500">{formatDate(t.date)}</td>
                        <td className="p-6">
                            <span className="font-bold text-gray-800 text-base">{t.title}</span>
                        </td>
                        <td className="p-6">
                            {t.type === 'transfer' ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl w-fit border border-gray-200">
                                    {t.paymentMode} <ArrowRight className="w-3 h-3"/> {t.category}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-xl border border-gray-200">{t.category}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                        {t.paymentMode === 'Cash' ? <Banknote className="w-3 h-3"/> : <Landmark className="w-3 h-3"/>} {t.paymentMode}
                                    </span>
                                </div>
                            )}
                        </td>
                        
                        {/* FIXED COLORS: GREEN (Income), RED (Expense), BLACK (Transfer) */}
                        <td className="p-6">
                            <span className={`flex items-center gap-1.5 font-bold text-base ${t.type === 'income' ? 'text-emerald-600' : (t.type === 'expense' ? 'text-red-600' : 'text-gray-900')}`}>
                                {t.type === 'income' ? '+' : (t.type === 'expense' ? '-' : '')} {formatCurrency(t.amount)}
                            </span>
                        </td>
                        
                        <td className="p-6 text-center">
                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => openEdit(t)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(t._id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </td>
                    </tr>
                ))}
                {paginatedData.length === 0 && <tr><td colSpan="5" className="p-20 text-center text-gray-400 italic">No transactions found for {formattedMonth}.</td></tr>}
                </tbody>
            </table>
            </div>
        </div>

        {/* FORM MODAL (Add/Edit) */}
        {showForm && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl relative transform transition-all scale-100 border border-gray-100">
                <button onClick={closeForm} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition"><X className="w-5 h-5 text-gray-500" /></button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">{editId ? 'Edit' : 'New'} Transaction</h2>
                
                <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 rounded-2xl">
                    {['expense', 'income', 'transfer'].map(type => (
                        <button key={type} onClick={() => setTxType(type)} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 ${txType === type ? 'bg-white shadow-lg text-black' : 'text-gray-500 hover:text-gray-700'}`}>{type}</button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                {txType !== 'transfer' && (<div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Title</label><input type="text" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5 font-bold text-gray-800 transition-all placeholder-gray-400" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Grocery" /></div>)}
                
                <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Amount</label><input type="number" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5 font-bold text-gray-800 transition-all placeholder-gray-400" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} placeholder="0.00" /></div>
                
                {txType === 'transfer' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">From</label><select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 appearance-none cursor-pointer" value={formData.paymentMode} onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}><option value="Bank">Bank</option><option value="Cash">Cash</option><option value="Investment">Investment</option></select></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">To</label><select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 appearance-none cursor-pointer" value={formData.transferTo} onChange={(e) => setFormData({ ...formData, transferTo: e.target.value })}><option value="Bank">Bank</option><option value="Cash">Cash</option><option value="Investment">Investment</option></select></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Category</label><select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 appearance-none cursor-pointer" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>{DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}<option value="Other">Other</option></select></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Source</label><select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-700 appearance-none cursor-pointer" value={formData.paymentMode} onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}><option value="Bank">Bank</option><option value="Cash">Cash</option></select></div>
                    </div>
                )}
                
                {txType !== 'transfer' && formData.category === 'Other' && <input type="text" placeholder="Type category..." required className="w-full p-4 bg-blue-50 text-blue-800 font-bold border-none rounded-2xl outline-none" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />}
                
                <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-black shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 mt-2">{editId ? 'Update Transaction' : 'Save Transaction'}</button>
                </form>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};
export default Financial;