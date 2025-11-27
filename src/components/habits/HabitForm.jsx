import React from 'react';
import { Plus, Save, X } from 'lucide-react';

const HabitForm = ({ 
  handleSubmit, 
  newHabit, setNewHabit, 
  newTarget, setNewTarget, 
  editId, cancelEdit 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
         <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           Habit Analytics
         </h1>
         <p className="text-sm text-gray-500">Track your goals and progress.</p>
      </div>
      
      <form onSubmit={handleSubmit} className={`flex gap-2 w-full md:w-auto p-2 rounded-xl shadow-sm border ${editId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
          <input 
            type="text" 
            placeholder="Habit Name..." 
            className="p-2 border-none outline-none focus:ring-0 w-full md:w-64 bg-transparent"
            value={newHabit} 
            onChange={(e) => setNewHabit(e.target.value)} 
          />
          <div className="flex items-center border-l border-gray-300 pl-2 gap-1">
              <span className="text-xs text-gray-500 font-bold">GOAL:</span>
              <input 
                type="number" 
                placeholder="21" 
                className="w-12 p-1 border border-gray-200 rounded text-center outline-none"
                value={newTarget} 
                onChange={(e) => setNewTarget(e.target.value)} 
              />
          </div>
          <button type="submit" className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 text-white ${editId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-black hover:bg-gray-800'}`}>
              {editId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
          {editId && (
              <button type="button" onClick={cancelEdit} className="text-gray-500 hover:text-red-500 px-2">
                  <X className="w-5 h-5" />
              </button>
          )}
      </form>
    </div>
  );
};

export default HabitForm;