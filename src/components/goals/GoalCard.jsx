import React from 'react';
import { Target, Calendar, Pencil, Trash2, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const GoalCard = ({ goal, handleEdit, handleDelete }) => {
  const today = new Date();
  const dueDate = new Date(goal.deadline);
  const diffTime = dueDate - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;

  // Visual Theme based on type
  const isLongTerm = goal.type === 'Long Term';
  const themeColor = isLongTerm ? 'text-indigo-600 bg-indigo-50' : 'text-orange-500 bg-orange-50';
  const borderColor = isLongTerm ? 'border-indigo-100' : 'border-orange-100';

  return (
    <div className={`p-6 bg-white rounded-2xl shadow-sm border flex flex-col justify-between h-full transition hover:shadow-md ${borderColor}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${themeColor}`}>
                {isLongTerm ? <Target className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isLongTerm ? 'text-indigo-400' : 'text-orange-400'}`}>
                    {goal.type}
                </span>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{goal.title}</h3>
            </div>
        </div>
        <div className="flex gap-1">
            <button onClick={() => handleEdit(goal)} className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => handleDelete(goal._id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Time Remaining Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {formatDate(goal.deadline)}</span>
        </div>
        
        {isOverdue ? (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-center border border-red-100">
                Overdue by {Math.abs(daysLeft)} Days
            </div>
        ) : (
            <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-800">{daysLeft}</span>
                <span className="text-sm text-gray-500">Days Remaining</span>
            </div>
        )}
      </div>

      {/* Mark Complete Button */}
      <button 
        onClick={() => handleDelete(goal._id)} 
        className="w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-100 transition"
      >
        <CheckCircle className="w-4 h-4" /> Mark Completed
      </button>
    </div>
  );
};

export default GoalCard;