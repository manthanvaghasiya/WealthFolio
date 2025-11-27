import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, CheckCircle, Circle, Trash2, Calendar, Trophy } from 'lucide-react';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);

  // Get Today's Date in "YYYY-MM-DD" format (to match database)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await API.get('/habits');
      setHabits(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    try {
      const res = await API.post('/habits', { title: newHabit });
      setHabits([res.data, ...habits]);
      setNewHabit('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHabit = async (id) => {
    // Optimistic UI Update (Update screen instantly before server replies)
    const updatedHabits = habits.map(h => {
      if (h._id === id) {
        const isCompleted = h.completedDates.includes(today);
        return {
          ...h,
          completedDates: isCompleted 
            ? h.completedDates.filter(d => d !== today) 
            : [...h.completedDates, today]
        };
      }
      return h;
    });
    setHabits(updatedHabits);

    // Send to Server
    try {
      await API.put(`/habits/${id}/toggle`, { date: today });
    } catch (err) {
      console.error("Error toggling habit", err);
      fetchHabits(); // Revert on error
    }
  };

  const deleteHabit = async (id) => {
    if(!window.confirm("Delete this habit?")) return;
    try {
      await API.delete(`/habits/${id}`);
      setHabits(habits.filter(h => h._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate total completion for today
  const completedCount = habits.filter(h => h.completedDates.includes(today)).length;
  const totalCount = habits.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" /> Daily Habits
            </h1>
            <p className="text-gray-500">Build discipline, one day at a time.</p>
        </div>
        
        {/* Progress Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
            <div>
                <p className="text-blue-100 text-sm font-medium">Today's Progress</p>
                <h2 className="text-3xl font-bold">{progress}%</h2>
            </div>
            <Trophy className="w-10 h-10 text-yellow-300 opacity-80" />
        </div>
      </div>

      {/* Add Habit Form */}
      <form onSubmit={addHabit} className="mb-8 flex gap-2">
        <input 
            type="text" 
            placeholder="Enter a new habit (e.g., Read 5 pages)..." 
            className="flex-1 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
        />
        <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add
        </button>
      </form>

      {/* Habits List */}
      <div className="grid gap-4">
        {habits.map(habit => {
            const isCompleted = habit.completedDates.includes(today);
            const streak = habit.completedDates.length; // Simple count (Total days)
            
            return (
                <div key={habit._id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => toggleHabit(habit._id)} className="transition-transform active:scale-90">
                            {isCompleted 
                                ? <CheckCircle className="w-8 h-8 text-green-500 fill-green-100" /> 
                                : <Circle className="w-8 h-8 text-gray-300 hover:text-blue-500" />
                            }
                        </button>
                        <div>
                            <h3 className={`font-bold text-lg ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                {habit.title}
                            </h3>
                            <p className="text-xs text-gray-400">🔥 {streak} days completed total</p>
                        </div>
                    </div>
                    
                    <button onClick={() => deleteHabit(habit._id)} className="text-gray-300 hover:text-red-500 p-2">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            )
        })}
        
        {habits.length === 0 && !loading && (
            <div className="text-center p-10 bg-gray-50 rounded-xl text-gray-400">
                No habits yet. Start by adding one above!
            </div>
        )}
      </div>
    </div>
  );
};

export default Habits;