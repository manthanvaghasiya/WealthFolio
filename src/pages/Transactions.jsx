import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { 
  Search, ArrowUpRight, ArrowDownLeft, Trash2, Download, 
  Filter, ChevronLeft, ChevronRight, Pencil, X, Save, TrendingUp 
} from 'lucide-react';
import Papa from 'papaparse';

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Salary', 'Shopping', 'Health', 'Education', 'Investment'];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterDate, setFilterDate] = useState('');      // 👈 NEW: date filter state

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit State
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', amount: '', category: '', type: '' });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions');
      setTransactions(res.data);
      setLoading(false);
    } catch (err) { 
      console.error("Error", err); 
      setLoading(false); 
    }
  };

  // --- ACTIONS ---
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this transaction?")) return;
    try {
      await API.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) { console.error(err); }
  };

  const startEdit = (transaction) => {
    setEditId(transaction._id);
    setEditFormData({
      title: transaction.title,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditFormData({ title: '', amount: '', category: '', type: '' });
  };

  const saveEdit = async () => {
    try {
      const res = await API.put(`/transactions/${editId}`, {
        ...editFormData,
        amount: Number(editFormData.amount)
      });
      setTransactions(transactions.map(t => t._id === editId ? res.data : t));
      setEditId(null);
    } catch (err) { alert("Failed to update transaction."); }
  };

  // --- EXPORT ---
  const handleExport = () => {
    const csvData = transactions.map(t => ({
      Date: formatDate(t.date),
      Title: t.title,
      Category: t.category,
      Type: t.type.toUpperCase(),
      Amount: t.amount
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'LifeOS_Transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTER & SORT ---
  const filteredData = transactions
    .filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || t.type === filterType;

      // 👇 NEW: only match selected date (YYYY-MM-DD)
      let matchesDate = true;
      if (filterDate) {
        const txDate = new Date(t.date).toISOString().slice(0, 10); // "YYYY-MM-DD"
        matchesDate = txDate === filterDate;
      }

      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'highest') return b.amount - a.amount;
      if (sortOrder === 'lowest') return a.amount - b.amount;
      return 0;
    });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
          <p className="text-sm text-gray-500">Manage and track your financial records.</p>
        </div>
        <button 
          onClick={handleExport} 
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* SEARCH + FILTERS ROW (like your new design) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center bg-gray-50/50">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Filters right side */}
          <div className="flex gap-2 w-full md:w-auto">
            {/* Type filter (All / Income / Expense) */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-200 rounded-xl">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="bg-transparent outline-none text-sm font-medium text-gray-600"
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Date filter */}
            <input
              type="date"
              className="px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-600 bg-white"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
            />

            {/* Sort order */}
            <select
              className="px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-600 bg-white"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest</option>
              <option value="lowest">Lowest</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginatedData.map(t => (
                  <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    {/* EDIT MODE */}
                    {editId === t._id ? (
                      <>
                        <td className="p-4 text-gray-400">{formatDate(t.date)}</td>
                        <td className="p-4">
                          <input
                            className="border p-2 rounded w-full outline-none focus:border-blue-500" 
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          />
                        </td>
                        <td className="p-4">
                          <select
                            className="border p-2 rounded w-full outline-none focus:border-blue-500"
                            value={editFormData.category}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          >
                            {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            className="border p-2 rounded w-full outline-none focus:border-blue-500"
                            value={editFormData.type}
                            onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            className="border p-2 rounded w-24 outline-none focus:border-blue-500" 
                            value={editFormData.amount}
                            onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                          />
                        </td>
                        <td className="p-4 text-center flex justify-center gap-2">
                          <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-2 rounded transition">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="text-gray-500 hover:bg-gray-100 p-2 rounded transition">
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      // READ MODE
                      <>
                        <td className="p-4 text-gray-500">{formatDate(t.date)}</td>
                        <td className="p-4 font-medium text-gray-800">{t.title}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs border border-gray-200">
                            {t.category}
                          </span>
                        </td>
                        <td className="p-4">
                          {t.category === 'Investment' ? (
                            <span className="flex items-center gap-1 text-purple-600 font-medium text-xs">
                              <TrendingUp className="w-3 h-3" /> Invest
                            </span>
                          ) : (
                            <span
                              className={`text-xs font-medium ${
                                t.type === 'income' ? 'text-green-600' : 'text-red-500'
                              }`}
                            >
                              {t.type.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`flex items-center gap-1 font-bold ${
                              t.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {t.type === 'income' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                            {formatCurrency(t.amount)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => startEdit(t)}
                              className="text-gray-400 hover:text-blue-500 p-1 rounded transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t._id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredData.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <p>No transactions match your search.</p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
