import React from 'react';
import { BarChart2, Layers, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const HabitMonthlyOverview = ({ leaderboardMonth, setLeaderboardMonth, monthlyStats, activeHabitsCount, avgDailyConsistency }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-600" /> Monthly Progress Overview</h3>
          <input type="month" value={leaderboardMonth} onChange={(e) => setLeaderboardMonth(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg lg:col-span-1 flex flex-col justify-between">
               <div>
                   <div className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wide">Summary</div>
                   <h4 className="text-2xl font-bold mb-4">{new Date(leaderboardMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                   <div className="flex items-center gap-2 mb-2"><Layers className="w-5 h-5 text-indigo-200" /><span className="text-lg font-medium">{activeHabitsCount} Habits Active</span></div>
               </div>
               <div className="mt-6">
                   <div className="text-6xl font-extrabold tracking-tighter">{avgDailyConsistency}%</div>
                   <div className="flex items-center gap-2 text-indigo-100 mt-2"><Activity className="w-4 h-4" /><span className="text-sm font-medium">Avg. Daily Consistency</span></div>
               </div>
           </div>
           <div className="lg:col-span-3 flex flex-col h-full">
               <div className="h-48 w-full mb-6 min-h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={monthlyStats}><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill:'#9CA3AF'}} interval={0} /><Tooltip cursor={{fill: '#EEF2FF'}} contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} /><Bar dataKey="completed" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={12} /></BarChart>
                   </ResponsiveContainer>
               </div>
               <div className="flex-1 overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                   <table className="w-full text-center border-collapse min-w-[800px]">
                       <tbody className="text-xs text-gray-600">
                           <tr className="border-b border-gray-100 group hover:bg-gray-50">
                               <td className="p-3 font-bold text-left bg-gray-50 text-gray-700 w-24 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 border-r border-gray-200">Completed</td>
                               {monthlyStats.map(stat => <td key={stat.date} className="p-2 min-w-[40px] group-hover:font-bold text-indigo-600">{stat.completed}</td>)}
                           </tr>
                           <tr className="border-b border-gray-100 group hover:bg-gray-50">
                               <td className="p-3 font-bold text-left bg-gray-50 text-gray-700 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 border-r border-gray-200">Goal</td>
                               {monthlyStats.map(stat => <td key={stat.date} className="p-2 min-w-[40px] text-gray-400">{stat.goal}</td>)}
                           </tr>
                           <tr className="border-b border-gray-100 group hover:bg-gray-50">
                               <td className="p-3 font-bold text-left bg-gray-50 text-gray-700 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 border-r border-gray-200">Left</td>
                               {monthlyStats.map(stat => <td key={stat.date} className="p-2 min-w-[40px] text-red-400 group-hover:text-red-500">{stat.left}</td>)}
                           </tr>
                           <tr className="bg-indigo-50 group">
                               <td className="p-3 font-bold text-left bg-indigo-100 text-indigo-900 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 border-r border-indigo-200">Daily %</td>
                               {monthlyStats.map(stat => <td key={stat.date} className="p-2 min-w-[40px] font-medium text-indigo-700 group-hover:font-bold">{stat.percent}%</td>)}
                           </tr>
                       </tbody>
                   </table>
               </div>
           </div>
        </div>
    </div>
  );
};
export default HabitMonthlyOverview;