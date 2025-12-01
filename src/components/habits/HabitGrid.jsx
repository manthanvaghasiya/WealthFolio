import React from 'react';
import { ChevronLeft, ChevronRight, Pencil, Trash2, Check } from 'lucide-react';

const HabitGrid = ({ habits, weekDays, today, handlePrevWeek, handleNextWeek, toggleHabitDate, handleEdit, deleteHabit }) => {
  
  const dateRangeText = `${new Date(weekDays[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(weekDays[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
          <h3 className="font-bold text-gray-900 text-lg">Weekly Grid</h3>
          <div className="flex items-center gap-4 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
              <button onClick={handlePrevWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full transition text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs font-bold text-gray-600 min-w-[90px] text-center">{dateRangeText}</span>
              <button onClick={handleNextWeek} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full transition text-gray-500"><ChevronRight className="w-4 h-4" /></button>
          </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="border-b border-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="p-5 w-1/3">Habit</th>
                      {weekDays.map(date => (
                          <th key={date} className={`p-3 text-center min-w-[50px] ${date === today ? 'text-indigo-600' : ''}`}>
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                          </th>
                      ))}
                      <th className="p-5 text-center">Actions</th>
                  </tr>
              </thead>
              <tbody className="text-sm">
                  {habits.map((habit) => (
                      <tr key={habit._id} className="group hover:bg-gray-50/50 transition border-b border-gray-50 last:border-0">
                          <td className="p-5">
                              <p className="font-bold text-gray-800 text-base">{habit.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((habit.completedDates.length / habit.target) * 100, 100)}%` }}></div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{habit.completedDates.length}/{habit.target}</span>
                              </div>
                          </td>
                          {weekDays.map(date => {
                              const isCompleted = habit.completedDates.includes(date);
                              return (
                                  <td key={date} className="p-2 text-center">
                                      <button 
                                          onClick={() => toggleHabitDate(habit._id, date)}
                                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 mx-auto
                                              ${isCompleted 
                                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 transform scale-110' 
                                                  : 'bg-gray-100 text-transparent hover:bg-gray-200'
                                              }`}
                                      >
                                          <Check className="w-4 h-4" strokeWidth={4} />
                                      </button>
                                  </td>
                              );
                          })}
                          <td className="p-5 text-center">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(habit)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                                  <button onClick={() => deleteHabit(habit._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default HabitGrid;