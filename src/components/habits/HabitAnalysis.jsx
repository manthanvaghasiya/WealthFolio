import React from 'react';
import { Trophy, AlertTriangle, ArrowDownRight, CheckCircle2, ArrowUpRight } from 'lucide-react';

const HabitAnalysis = ({ topHabitsMonthly, auditData, daysInLeaderboardMonth }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEADERBOARD CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 h-full flex flex-col">
            <h3 className="font-bold text-xl text-gray-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600"><Trophy className="w-5 h-5" /></div>
                Monthly Top 7
            </h3>
            
            <div className="space-y-5 flex-1">
              {topHabitsMonthly.map((habit, index) => {
                  const consistency = Math.round((habit.monthlyCount / daysInLeaderboardMonth) * 100); 
                  let rankColor = "bg-gray-100 text-gray-500";
                  if (index === 0) rankColor = "bg-yellow-100 text-yellow-700";
                  if (index === 1) rankColor = "bg-gray-200 text-gray-700";
                  if (index === 2) rankColor = "bg-orange-100 text-orange-700";

                  return (
                      <div key={habit._id} className="flex items-center gap-4 group">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rankColor} shrink-0`}>
                              {index + 1}
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1.5">
                                  <span className="font-bold text-gray-800">{habit.title}</span>
                                  <span className="font-medium text-gray-500">{consistency}%</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 group-hover:scale-x-105 origin-left" style={{ width: `${consistency}%` }}></div>
                              </div>
                          </div>
                      </div>
                  )
              })}
              {topHabitsMonthly.length === 0 && <div className="text-center py-10 text-gray-400 italic">No data available yet.</div>}
            </div>
        </div>

        {/* ACTION REQUIRED CARD */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 h-full flex flex-col">
            <h3 className="font-bold text-xl text-gray-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl text-red-600"><AlertTriangle className="w-5 h-5" /></div>
                Action Required
            </h3>
            
            <div className="flex-1">
              {auditData.length > 0 ? (
                  <div className="space-y-3">
                      {auditData.map((habit) => (
                          <div key={habit._id} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl hover:bg-red-50 transition-colors">
                              <div className="flex flex-col">
                                  <span className="font-bold text-gray-800 text-sm">{habit.title}</span>
                                  <span className="text-xs text-red-600 font-medium">Dropped by {Math.abs(habit.diff)}%</span>
                              </div>
                              <div className="flex items-center gap-1 text-red-600 font-bold text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm">
                                  <ArrowDownRight className="w-4 h-4" />
                                  {habit.currConsistency}%
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1">All Systems Go!</h4>
                      <p className="text-sm text-gray-500 max-w-[200px]">No declining habits found. You are staying consistent.</p>
                  </div>
              )}
            </div>
        </div>
    </div>
  );
};
export default HabitAnalysis;