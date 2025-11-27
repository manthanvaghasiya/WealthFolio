import React from 'react';
import { TrendingUp, PieChart as PieIcon, DollarSign, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/helpers';

const MOCK_ASSETS = [
  { name: 'Stocks', value: 50000, color: '#4F46E5' },
  { name: 'Crypto', value: 20000, color: '#10B981' },
  { name: 'Gold', value: 15000, color: '#F59E0B' },
  { name: 'Mutual Funds', value: 35000, color: '#6366F1' },
];

const Investments = () => {
  const totalValue = MOCK_ASSETS.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <TrendingUp className="text-blue-600" /> Investment Portfolio
      </h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Invested Value</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">₹{totalValue.toLocaleString()}</h2>
          <span className="text-green-500 text-sm font-medium flex items-center gap-1 mt-1">
            +12.5% <span className="text-gray-400 font-normal">all time</span>
          </span>
        </div>
        
        {/* Mock Stat Cards */}
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-blue-100 text-sm">Top Performer</p>
          <h2 className="text-2xl font-bold mt-2">Nifty 50 Index</h2>
          <p className="text-blue-200 text-sm mt-1">+8.2% this month</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Asset Allocation Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Asset Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={MOCK_ASSETS} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {MOCK_ASSETS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {MOCK_ASSETS.map(asset => (
                <div key={asset.name} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: asset.color}}></div>
                    {asset.name}
                </div>
            ))}
          </div>
        </div>

        {/* Asset List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Your Assets</h3>
                <button className="text-sm text-blue-600 font-medium hover:underline">+ Add Asset</button>
            </div>
            <div className="divide-y divide-gray-100">
                {MOCK_ASSETS.map((asset) => (
                    <div key={asset.name} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{asset.name}</p>
                                <p className="text-xs text-gray-500">Market Value</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-800">₹{asset.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;