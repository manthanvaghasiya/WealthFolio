import React, { useState, useEffect } from 'react';
import API from '../services/api'; // <--- NEW Central API
import { formatCurrency, formatDate } from '../utils/helpers'; // <--- NEW Helpers
import { Search, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions'); // Cleaner!
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
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

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
                  {/* Usage of Helper Functions */}
                  <td className="p-4 text-gray-500 text-sm">{formatDate(t.date)}</td>
                  <td className="p-4 font-medium text-gray-800">{t.title}</td>
                  <td className="p-4 text-gray-500"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{t.category}</span></td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      {formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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