import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const HabitStats = ({ trendData, donutData, completionRate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Weekly Trend</h3>
          <div className="h-64 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip />
                      <Line type="monotone" dataKey="completed" stroke="#4F46E5" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="font-bold text-gray-700 mb-4 self-start w-full">Daily Progress</h3>
          <div className="relative w-48 h-48 min-h-[192px]">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={donutData} innerRadius={60} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270}>
                          {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                  </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">{completionRate}%</span>
                  <span className="text-xs text-gray-400">TODAY</span>
              </div>
          </div>
      </div>
    </div>
  );
};
export default HabitStats;