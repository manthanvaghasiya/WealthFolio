import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // ⚠️ UPDATE URL IF USING RENDER
      const res = await axios.get('https://wealthfolio-api.onrender.com/api/transactions', getHeaders());
      setTransactions(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this transaction?")) return;
    try {
      await axios.delete(`https://wealthfolio-api.onrender.com/api/transactions/${id}`, getHeaders());
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

  // Filter Logic
  const filteredData = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="p-2 border border-gray-200 rounded-lg outline-none text-gray-600"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center">Loading...</div> : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Date</th>
                <th className="p-4 font-semibold text-gray-600">Title</th>
                <th className="p-4 font-semibold text-gray-600">Category</th>
                <th className="p-4 font-semibold text-gray-600">Amount</th>
                <th className="p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(t => (
                <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-500 text-sm">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-800">{t.title}</td>
                  <td className="p-4 text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{t.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      ₹{t.amount}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filteredData.length === 0 && !loading && <div className="p-8 text-center text-gray-500">No transactions found.</div>}
      </div>
    </div>
  );
};

export default Transactions;