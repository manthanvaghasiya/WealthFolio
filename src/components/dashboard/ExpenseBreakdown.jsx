import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as IconPieChart } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const ExpenseBreakdown = ({ transactions }) => {
  // 1. Filter Expenses (AND EXCLUDE INVESTMENTS)
  const expenses = transactions.filter(t => t.type === 'expense' && t.category !== 'Investment');
  
  // 2. Calculate Total Real Expense
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Group by Category
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  // 4. Sort by highest value
  categoryData.sort((a, b) => b.value - a.value);

  // Formatter for currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
        <IconPieChart className="w-5 h-5 text-orange-500" /> Expense Breakdown
      </h3>

      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
        {/* The Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              innerRadius={80} 
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text (Total) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Net Expense</span>
          <span className="text-xl font-bold text-gray-800">{formatCurrency(totalExpense)}</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {categoryData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
            />
            <span className="text-sm text-gray-600 font-medium">{entry.name}</span>
          </div>
        ))}
        {categoryData.length === 0 && <span className="text-gray-400 text-sm">No expenses recorded.</span>}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;