import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, Trash2, Pencil } from 'lucide-react';

const HabitGrid = ({ 
  habits, weekDays, today, 
  handlePrevWeek, handleNextWeek, 
  toggleHabitDate, handleEdit, deleteHabit 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar className="w-4 h-4" /> Weekly Grid</h3>
          <div className="flex items-center gap-4">
              <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-200 rounded-full transition"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
              <span className="text-sm font-medium text-gray-600">
                  {new Date(weekDays[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekDays[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <button onClick={handleNextWeek} className="p-1 hover:bg-gray-200 rounded-full transition"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
      </div>
      <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="p-4 border border-gray-200 text-center w-12">Sr.</th>
                      <th className="p-4 border border-gray-200 w-1/4">Habit Name</th>
                      <th className="p-4 border border-gray-200 text-center w-16">Goal</th>
                      {weekDays.map(date => (
                          <th key={date} className={`p-2 border border-gray-200 text-center w-12 ${date === today ? 'bg-blue-50 text-blue-600 font-bold' : ''}`}>
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}<br/>
                              <span className={date === today ? 'text-blue-600' : 'text-gray-400'}>{new Date(date).getDate()}</span>
                          </th>
                      ))}
                      <th className="p-4 border border-gray-200 text-center">Progress</th>
                      <th className="p-4 border border-gray-200 text-center">Status</th>
                      <th className="p-4 border border-gray-200 text-center">Action</th>
                  </tr>
              </thead>
              <tbody className="text-sm">
                  {habits.map((habit, index) => {
                      const completedCount = habit.completedDates.length;
                      const isGoalReached = completedCount >= habit.target;
                      return (
                          <tr key={habit._id} className="hover:bg-gray-50 transition">
                              <td className="p-4 border border-gray-200 text-center text-gray-500 font-medium">{index + 1}</td>
                              <td className="p-4 border border-gray-200 font-medium text-gray-800">{habit.title}</td>
                              <td className="p-4 border border-gray-200 text-center text-gray-500 font-bold bg-gray-50">{habit.target}</td>
                              {weekDays.map(date => (
                                  <td key={date} className={`p-2 border border-gray-200 text-center ${date === today ? 'bg-blue-50' : ''}`}>
                                      <input type="checkbox" checked={habit.completedDates.includes(date)} onChange={() => toggleHabitDate(habit._id, date)} className="w-5 h-5 accent-blue-600 cursor-pointer rounded" />
                                  </td>
                              ))}
                              <td className="p-4 border border-gray-200 text-center">
                                  <span className="font-bold text-blue-600 text-lg">{completedCount}</span>
                                  <span className="text-gray-400 text-sm"> / {habit.target}</span>
                              </td>
                              <td className="p-4 border border-gray-200 text-center">
                                  {isGoalReached ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Met Goal</span>
                                  ) : (
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Running</span>
                                  )}
                              </td>
                              <td className="p-4 border border-gray-200 text-center">
                                  <div className="flex items-center justify-center gap-2">
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
    </div>
  );
};

export default HabitGrid;