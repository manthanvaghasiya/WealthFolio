import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, X, Target, Clock } from 'lucide-react';
import GoalCard from '../components/goals/GoalCard';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Simplified Form State (No Money)
  const [formData, setFormData] = useState({
    title: '', 
    type: 'Long Term',
    deadline: ''
  });

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await API.get('/goals');
      setGoals(res.data);
      setLoading(false);
    } catch (err) { console.error("Error fetching goals", err); setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await API.put(`/goals/${editId}`, formData);
        setGoals(goals.map(g => g._id === editId ? res.data : g));
      } else {
        const res = await API.post('/goals', formData);
        setGoals([...goals, res.data]);
      }
      closeForm();
    } catch (err) { 
        console.error(err);
        alert("Error saving. Please Ensure you pushed Backend code to GitHub.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await API.delete(`/goals/${id}`);
      setGoals(goals.filter(g => g._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleEdit = (goal) => {
    setFormData({
      title: goal.title,
      type: goal.type || 'Long Term',
      deadline: goal.deadline ? goal.deadline.split('T')[0] : ''
    });
    setEditId(goal._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditId(null);
    setFormData({ title: '', type: 'Long Term', deadline: '' });
  };

  const longTermGoals = goals.filter(g => g.type === 'Long Term');
  const shortTermGoals = goals.filter(g => g.type === 'Short Term');

  if (loading) return <div className="p-10 text-center text-gray-500">Loading goals...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="text-red-500" /> Goals & Deadlines
            </h1>
            <p className="text-sm text-gray-500">Track your life objectives.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 flex items-center gap-2 shadow-lg">
            <Plus className="w-5 h-5" /> New Goal
        </button>
      </div>

      {/* SECTION 1: SHORT TERM */}
      <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Short Term Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortTermGoals.map(goal => (
                <GoalCard key={goal._id} goal={goal} handleEdit={handleEdit} handleDelete={handleDelete} />
            ))}
            {shortTermGoals.length === 0 && <div className="text-gray-400 text-sm italic">No short term goals.</div>}
          </div>
      </div>

      {/* SECTION 2: LONG TERM */}
      <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Long Term Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {longTermGoals.map(goal => (
                <GoalCard key={goal._id} goal={goal} handleEdit={handleEdit} handleDelete={handleDelete} />
            ))}
            {longTermGoals.length === 0 && <div className="text-gray-400 text-sm italic">No long term goals.</div>}
          </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-fadeIn">
                <button onClick={closeForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">{editId ? 'Edit Goal' : 'Create New Goal'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Goal Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                        <select 
                            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.type} 
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="Long Term">Long Term</option>
                            <option value="Short Term">Short Term</option>
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" required placeholder="Goal Name..." className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                            value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>

                    {/* Deadline (Required for both now) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Date / Deadline</label>
                        <input type="date" required className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                            value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                        {editId ? 'Update Goal' : 'Create Goal'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Goals;