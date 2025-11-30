import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, Trash2, Pencil, Check } from 'lucide-react';

const HabitGrid = ({ habits, weekDays, today, handlePrevWeek, handleNextWeek, toggleHabitDate, handleEdit, deleteHabit }) => {
  
  // Date Range Text (e.g., Nov 24 - Nov 30)
  const dateRangeText = `${new Date(weekDays[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(weekDays[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* --- HEADER (Navigation) --- */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky left-0">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
            <Calendar className="w-4 h-4" /> Weekly Grid
          </h3>
          <div className="flex items-center gap-2 md:gap-4">
              <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-200 rounded-full transition"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
              <span className="text-xs md:text-sm font-medium text-gray-600 min-w-[100px] text-center">
                  {dateRangeText}
              </span>
              <button onClick={handleNextWeek} className="p-1 hover:bg-gray-200 rounded-full transition"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
      </div>

      {/* ============================================ */}
      {/* VIEW 1: DESKTOP TABLE (Hidden on Mobile)     */}
      {/* ============================================ */}
      <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="p-4 border border-gray-200 text-center w-12">Sr.</th>
                      <th className="p-4 border border-gray-200 w-1/4">Habit Name</th>
                      <th className="p-4 border border-gray-200 text-center w-16">Goal</th>
                      {weekDays.map(date => (
                          <th key={date} className={`p-2 border border-gray-200 text-center w-12 ${date === today ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}>
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}<br/>
                              <span className={date === today ? 'text-blue-600' : 'text-gray-400'}>{new Date(date).getDate()}</span>
                          </th>
                      ))}
                      <th className="p-4 border border-gray-200 text-center">Progress</th>
                      <th className="p-4 border border-gray-200 text-center">Actions</th>
                  </tr>
              </thead>
              <tbody className="text-sm">
                  {habits.map((habit, index) => {
                      const completedCount = habit.completedDates.length;
                      return (
                          <tr key={habit._id} className="hover:bg-gray-50 transition">
                              <td className="p-4 border border-gray-200 text-center text-gray-500">{index + 1}</td>
                              <td className="p-4 border border-gray-200 font-medium text-gray-800">{habit.title}</td>
                              <td className="p-4 border border-gray-200 text-center text-gray-500 font-bold bg-gray-50">{habit.target}</td>
                              {weekDays.map(date => (
                                  <td key={date} className={`p-2 border border-gray-200 text-center ${date === today ? 'bg-blue-50' : ''}`}>
                                      <input type="checkbox" checked={habit.completedDates.includes(date)} onChange={() => toggleHabitDate(habit._id, date)} className="w-5 h-5 accent-blue-600 cursor-pointer rounded" />
                                  </td>
                              ))}
                              <td className="p-4 border border-gray-200 text-center"><span className="font-bold text-blue-600">{completedCount}</span> / {habit.target}</td>
                              <td className="p-4 border border-gray-200 text-center">
                                  <div className="flex justify-center gap-2">
                                      <button onClick={() => handleEdit(habit)} className="text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                                      <button onClick={() => deleteHabit(habit._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
      </div>

      {/* ============================================ */}
      {/* VIEW 2: MOBILE CARD LIST (Visible on Mobile) */}
      {/* ============================================ */}
      <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {habits.map((habit) => {
              const completedCount = habit.completedDates.length;
              return (
                  <div key={habit._id} className="p-4">
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <h4 className="font-bold text-gray-800 text-lg">{habit.title}</h4>
                              <span className="text-xs text-gray-500">Goal: {completedCount} / {habit.target} days</span>
                          </div>
                          <div className="flex gap-3">
                              <button onClick={() => handleEdit(habit)} className="text-gray-400 hover:text-blue-500"><Pencil className="w-5 h-5" /></button>
                              <button onClick={() => deleteHabit(habit._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                          </div>
                      </div>

                      {/* 7 Day Circles */}
                      <div className="flex justify-between items-center">
                          {weekDays.map(date => {
                              const isCompleted = habit.completedDates.includes(date);
                              const isToday = date === today;
                              const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
                              
                              return (
                                  <div key={date} className="flex flex-col items-center gap-1">
                                      {/* Day Label (e.g. M) */}
                                      <span className={`text-[10px] font-bold ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                                          {dayName}
                                      </span>
                                      
                                      {/* Clickable Circle */}
                                      <button 
                                          onClick={() => toggleHabitDate(habit._id, date)}
                                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 
                                              ${isCompleted 
                                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-105' 
                                                  : (isToday ? 'bg-white border-blue-400 text-transparent' : 'bg-gray-50 border-gray-200 text-transparent')
                                              }`}
                                      >
                                          <Check className="w-5 h-5" strokeWidth={3} />
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              );
          })}
          {habits.length === 0 && <div className="p-8 text-center text-gray-400">No habits found.</div>}
      </div>

    </div>
  );
};

export default HabitGrid;