import React from 'react';
import { Target, Trophy, Plus } from 'lucide-react';

const MOCK_GOALS = [
  { id: 1, title: 'New Macbook Pro', target: 200000, current: 120000, deadline: '2025-12-01', color: 'bg-blue-600' },
  { id: 2, title: 'Emergency Fund', target: 100000, current: 85000, deadline: '2024-06-01', color: 'bg-green-600' },
  { id: 3, title: 'Europe Trip', target: 300000, current: 45000, deadline: '2026-01-01', color: 'bg-purple-600' },
];

const Goals = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-red-500" /> Financial Goals
        </h1>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_GOALS.map((goal) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            
            return (
                <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {percentage.toFixed(0)}%
                        </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">Target: ₹{goal.target.toLocaleString()} by {new Date(goal.deadline).toLocaleDateString()}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${goal.color}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-700">₹{goal.current.toLocaleString()}</span>
                        <span className="text-gray-400">saved</span>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Goals;