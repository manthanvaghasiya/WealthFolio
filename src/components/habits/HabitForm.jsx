import React from 'react';
import { Plus, Save, X, Target } from 'lucide-react';

const HabitForm = ({ handleSubmit, newHabit, setNewHabit, newTarget, setNewTarget, editId, cancelEdit }) => {
  return (
    <form onSubmit={handleSubmit} className="relative z-10">
      <div className="space-y-4">
          
          {/* Input Field */}
          <div className="group relative">
            <input 
                type="text" 
                placeholder="e.g., Read 10 pages..." 
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-medium rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder-gray-400"
                value={newHabit} 
                onChange={(e) => setNewHabit(e.target.value)} 
            />
          </div>

          {/* Target & Button Row */}
          <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl flex-1">
                  <Target className="w-4 h-4 text-gray-400" />
                  <input 
                    type="number" 
                    placeholder="21" 
                    className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none"
                    value={newTarget} 
                    onChange={(e) => setNewTarget(e.target.value)} 
                  />
                  <span className="text-xs text-gray-400 font-medium">days</span>
              </div>

              <button 
                type="submit" 
                className={`px-5 py-2 rounded-xl font-bold text-white shadow-lg transition-transform transform active:scale-95 flex items-center gap-2
                    ${editId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
                `}
              >
                  {editId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editId ? 'Update' : 'Add'}
              </button>
              
              {editId && (
                  <button type="button" onClick={cancelEdit} className="p-2.5 text-gray-400 hover:text-red-500 bg-gray-50 rounded-xl transition">
                      <X className="w-5 h-5" />
                  </button>
              )}
          </div>
      </div>
    </form>
  );
};
export default HabitForm;