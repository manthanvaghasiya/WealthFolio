import React from 'react';
import { Trophy, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const HabitAnalysis = ({ topHabitsMonthly, auditData, daysInLeaderboardMonth }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Monthly Top 10</h3>
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {topHabitsMonthly.map((habit, index) => {
                  const consistency = Math.round((habit.monthlyCount / daysInLeaderboardMonth) * 100); 
                  return (
                      <div key={habit._id}>
                          <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">{index + 1}. {habit.title}</span>
                              <span className="font-bold text-gray-900">{habit.monthlyCount} Days <span className="text-gray-400 font-normal">({consistency}%)</span></span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${consistency}%` }}></div>
                          </div>
                      </div>
                  )
              })}
              {topHabitsMonthly.length === 0 && <div className="text-center py-10 text-gray-400">No data available for this month.</div>}
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6"><AlertCircle className="w-5 h-5 text-purple-600" /> Action Required (Top 10 Declines)</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-purple-50 text-purple-900 text-xs uppercase tracking-wider">
                          <th className="p-4 border-b border-purple-100">Habit</th>
                          <th className="p-4 border-b border-purple-100 text-center">Last Mo.</th>
                          <th className="p-4 border-b border-purple-100 text-center">This Mo.</th>
                          <th className="p-4 border-b border-purple-100 text-center">Change</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm">
                      {auditData.map((habit) => {
                          const isImprovement = habit.diff >= 0;
                          return (
                              <tr key={habit._id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                  <td className="p-4 font-medium text-gray-800">{habit.title}</td>
                                  <td className="p-4 text-center text-gray-500">{habit.prevConsistency}%</td>
                                  <td className="p-4 text-center font-bold text-gray-800">{habit.currConsistency}%</td>
                                  <td className="p-4 text-center">
                                      <span className={`inline-flex items-center gap-1 font-bold ${isImprovement ? 'text-green-600' : 'text-red-500'}`}>
                                          {isImprovement ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}{Math.abs(habit.diff)}%
                                      </span>
                                  </td>
                              </tr>
                          );
                      })}
                      {auditData.length === 0 && <tr><td colSpan="4" className="text-center py-10 text-gray-400">No performance data yet.</td></tr>}
                  </tbody>
              </table>
            </div>
        </div>
    </div>
  );
};
export default HabitAnalysis;