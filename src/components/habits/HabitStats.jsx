import React from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const HabitStats = ({ trendData }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/60 border border-gray-100 flex flex-col h-64 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5"><Activity className="w-24 h-24 text-indigo-600" /></div>
        
        <div className="mb-4 relative z-10">
            <h3 className="text-lg font-bold text-gray-900">Weekly Momentum</h3>
            <p className="text-gray-500 text-sm">Your consistency over the last 7 days.</p>
        </div>

        <div className="flex-1 w-full min-h-[150px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9CA3AF', fontSize: 10}} 
                        dy={10}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        cursor={{ stroke: '#E0E7FF', strokeWidth: 2 }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#4F46E5" 
                        strokeWidth={4} 
                        dot={{r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff'}} 
                        activeDot={{r: 6}}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
export default HabitStats;