import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Plus, X, Target, Clock, Sparkles, Mountain, Flag, 
  Calendar, CheckCircle2, MoreVertical, Pencil, Trash2, Undo 
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', type: 'Long Term', deadline: '' });
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await API.get('/goals');
      setGoals(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
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
    } catch (err) { alert("Error saving goal."); }
  };

  const handleToggle = async (id) => {
    setGoals(goals.map(g => 
        g._id === id ? { ...g, isCompleted: !g.isCompleted, updatedAt: new Date().toISOString() } : g
    ));
    try { await API.put(`/goals/${id}/toggle`); } catch (err) { fetchGoals(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try { await API.delete(`/goals/${id}`); setGoals(goals.filter(g => g._id !== id)); } catch (err) {}
  };

  const handleEdit = (goal) => {
    setFormData({
      title: goal.title,
      type: goal.type || 'Long Term',
      deadline: goal.deadline ? goal.deadline.split('T')[0] : ''
    });
    setEditId(goal._id);
    setShowForm(true);
    setMenuOpenId(null);
  };

  const closeForm = () => {
    setShowForm(false); setEditId(null);
    setFormData({ title: '', type: 'Long Term', deadline: '' });
  };

  const todayDateString = new Date().toLocaleDateString();

  const visibleGoals = goals.filter(g => {
      if (!g.isCompleted) return true;
      const completedDate = new Date(g.updatedAt).toLocaleDateString();
      return completedDate === todayDateString;
  });

  const longTermGoals = visibleGoals.filter(g => g.type === 'Long Term');
  const shortTermGoals = visibleGoals.filter(g => g.type === 'Short Term');

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 font-medium">Loading your vision...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
        
        {/* 1. HEADER (Fixed Font) */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    Goals & Vision <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-200 animate-pulse" />
                </h1>
                <p className="text-gray-500 font-medium mt-1 text-base">Define your future. Execute today.</p>
            </div>
            <button onClick={() => setShowForm(true)} className="group flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-sm">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> New Goal
            </button>
        </div>

        {/* 2. MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* LEFT: SHORT TERM GOALS */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-100/50 border border-orange-50 flex flex-col relative overflow-hidden min-h-[500px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600"><Clock className="w-6 h-6" /></div>
                        Short Term
                    </h3>
                    <span className="text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-100">{shortTermGoals.length} Active</span>
                </div>

                <div className="p-6 space-y-4">
                    {shortTermGoals.length > 0 ? shortTermGoals.map(goal => (
                        <GoalItem key={goal._id} goal={goal} handleToggle={handleToggle} handleEdit={handleEdit} handleDelete={handleDelete} menuOpenId={menuOpenId} setMenuOpenId={setMenuOpenId} />
                    )) : (
                        <EmptyState message="No short term goals set." icon={<Clock className="w-8 h-8 text-orange-300"/>} />
                    )}
                </div>
            </div>

            {/* RIGHT: LONG TERM GOALS */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 flex flex-col relative overflow-hidden min-h-[500px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
                
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600"><Mountain className="w-6 h-6" /></div>
                        Long Term
                    </h3>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">{longTermGoals.length} Active</span>
                </div>

                <div className="p-6 space-y-4">
                    {longTermGoals.length > 0 ? longTermGoals.map(goal => (
                        <GoalItem key={goal._id} goal={goal} handleToggle={handleToggle} handleEdit={handleEdit} handleDelete={handleDelete} menuOpenId={menuOpenId} setMenuOpenId={setMenuOpenId} />
                    )) : (
                        <EmptyState message="No long term vision yet." icon={<Mountain className="w-8 h-8 text-indigo-300"/>} />
                    )}
                </div>
            </div>

        </div>

        {/* FORM MODAL */}
        {showForm && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative transform transition-all scale-100 border border-gray-100">
                    <button onClick={closeForm} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition"><X className="w-5 h-5 text-gray-500" /></button>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">{editId ? 'Refine Goal' : 'New Goal'}</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Goal Title</label>
                            <input type="text" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5 font-medium text-gray-800 transition-all placeholder-gray-400" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Save ₹1 Lakh" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Horizon</label>
                                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 appearance-none cursor-pointer" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                    <option value="Short Term">Short Term</option>
                                    <option value="Long Term">Long Term</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Deadline</label>
                                <input type="date" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium text-gray-700 cursor-pointer" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-black shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 mt-4">
                            Save Vision
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

const GoalItem = ({ goal, handleToggle, handleEdit, handleDelete, menuOpenId, setMenuOpenId }) => {
    const isOverdue = new Date(goal.deadline) < new Date().setHours(0,0,0,0) && !goal.isCompleted;
    const isCompleted = goal.isCompleted;
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

    return (
        <div className={`relative group p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg flex justify-between items-center
            ${isCompleted ? 'bg-green-50 border-green-100 opacity-90' : 'bg-white border-gray-100 hover:border-gray-200'}
        `}>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => handleToggle(goal._id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-gray-400'}
                    `}
                >
                    <CheckCircle2 className="w-4 h-4" />
                </button>
                
                <div>
                    {/* Fixed Font Weight */}
                    <h4 className={`font-semibold text-base transition-all ${isCompleted ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                        {goal.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1
                            ${isCompleted ? 'bg-green-200 text-green-800' : (isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500')}
                        `}>
                            <Calendar className="w-3 h-3" />
                            {isCompleted ? 'Completed Today' : (isOverdue ? 'Overdue' : formatDate(goal.deadline))}
                        </span>
                        {!isCompleted && !isOverdue && (
                            <span className="text-[10px] font-medium text-gray-400">{daysLeft} days left</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative">
                <button 
                    onClick={() => setMenuOpenId(menuOpenId === goal._id ? null : goal._id)}
                    className="p-2 text-gray-300 hover:text-gray-600 rounded-xl transition"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
                
                {menuOpenId === goal._id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-100 shadow-xl rounded-xl p-1 z-20 w-32 animate-fade-in">
                        <button onClick={() => handleEdit(goal)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition text-left">
                            <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(goal._id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition text-left">
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ message, icon }) => (
    <div className="py-20 text-center flex flex-col items-center justify-center opacity-50">
        <div className="mb-3 p-4 bg-gray-50 rounded-full">{icon}</div>
        <p className="text-gray-500 font-medium">{message}</p>
    </div>
);

export default Goals;