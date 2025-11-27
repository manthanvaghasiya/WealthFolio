import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Trash2, Trophy, TrendingUp, Calendar, ChevronLeft, ChevronRight, CheckCircle, Pencil, Save, X, ArrowUpRight, ArrowDownRight, BarChart2, AlertCircle, Activity, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newHabit, setNewHabit] = useState('');
  const [newTarget, setNewTarget] = useState(21);
  const [editId, setEditId] = useState(null); 

  // View States
  const [viewDate, setViewDate] = useState(new Date()); 
  const [leaderboardMonth, setLeaderboardMonth] = useState(new Date().toISOString().slice(0, 7)); 

  // --- HELPER: Dates ---
  const getCurrentWeekDays = (referenceDate) => {
    const d = new Date(referenceDate);
    const day = d.getDay(); 
    const diff = day === 0 ? 6 : day - 1; 
    const monday = new Date(d);
    monday.setDate(d.getDate() - diff); 
    const week = [];
    for (let i = 0; i < 7; i++) {
      const temp = new Date(monday);
      temp.setDate(monday.getDate() + i);
      week.push(temp.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDays = getCurrentWeekDays(viewDate);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await API.get('/habits');
      setHabits(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  // --- FIXED HANDLE SUBMIT (ADD & EDIT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      if (editId) {
        // UPDATE Logic
        const res = await API.put(`/habits/${editId}`, {
          title: newHabit,
          target: Number(newTarget)
        });
        
        // Update local state immediately with new data
        setHabits(prev => prev.map(h => h._id === editId ? res.data : h));
        setEditId(null); 
      } else {
        // ADD Logic
        const res = await API.post('/habits', { 
          title: newHabit,
          target: Number(newTarget) 
        });
        setHabits(prev => [res.data, ...prev]);
      }
      // Reset Form
      setNewHabit('');
      setNewTarget(21);
    } catch (err) { 
        console.error("Error saving habit", err); 
        alert("Error saving. Check console.");
    }
  };

  // Start Edit Mode
  const handleEdit = (habit) => {
    setNewHabit(habit.title);
    setNewTarget(habit.target || 21);
    setEditId(habit._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditId(null);
    setNewHabit('');
    setNewTarget(21);
  };

  const toggleHabitDate = async (id, date) => {
    // Optimistic UI Update
    const updatedHabits = habits.map(h => {
      if (h._id === id) {
        const isCompleted = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: isCompleted 
            ? h.completedDates.filter(d => d !== date) 
            : [...h.completedDates, date]
        };
      }
      return h;
    });
    setHabits(updatedHabits);
    try { await API.put(`/habits/${id}/toggle`, { date }); } catch (err) { fetchHabits(); }
  };

  const deleteHabit = async (id) => {
    if(!window.confirm("Delete this habit?")) return;
    try {
      await API.delete(`/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
    } catch (err) { console.error(err); }
  };

  const handlePrevWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() - 7);
    setViewDate(newDate);
  };
  const handleNextWeek = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + 7);
    setViewDate(newDate);
  };

  // --- ANALYTICS CALCULATIONS ---
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);
  
  const donutData = [
    { name: 'Completed', value: completedToday, color: '#10B981' },
    { name: 'Left', value: totalHabits - completedToday, color: '#E5E7EB' }
  ];

  const trendData = weekDays.map(date => {
    const count = habits.filter(h => h.completedDates.includes(date)).length;
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: count
    };
  });

  // --- MONTHLY OVERVIEW ---
  const getDaysInSelectedMonth = () => {
    const [year, month] = leaderboardMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) {
      days.push(date.toISOString().slice(0, 10)); 
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
  const selectedMonthDays = getDaysInSelectedMonth();
  const monthlyStats = selectedMonthDays.map(date => {
    const dayNum = date.split('-')[2]; 
    const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
    const goalCount = habits.length; 
    const leftCount = goalCount - completedCount;
    const percentage = goalCount === 0 ? 0 : Math.round((completedCount / goalCount) * 100);
    return { date, day: dayNum, completed: completedCount, goal: goalCount, left: leftCount, percent: percentage };
  });

  // --- DATA PREPARATION FOR TABLES ---
  const daysInLeaderboardMonth = selectedMonthDays.length;
  const topHabitsMonthly = habits.map(habit => {
      const count = habit.completedDates.filter(d => d.startsWith(leaderboardMonth)).length;
      return { ...habit, monthlyCount: count };
  }).sort((a, b) => b.monthlyCount - a.monthlyCount).slice(0, 10);

  const currentMonthStr = new Date().toISOString().slice(0, 7); 
  const prevDateObj = new Date();
  prevDateObj.setMonth(prevDateObj.getMonth() - 1);
  const prevMonthStr = prevDateObj.toISOString().slice(0, 7); 
  const daysPassedInCurrentMonth = new Date().getDate(); 
  const totalDaysInPrevMonth = new Date(prevDateObj.getFullYear(), prevDateObj.getMonth() + 1, 0).getDate(); 

  const auditData = habits.map(habit => {
      const prevCount = habit.completedDates.filter(d => d.startsWith(prevMonthStr)).length;
      const prevConsistency = Math.round((prevCount / totalDaysInPrevMonth) * 100);
      const currCount = habit.completedDates.filter(d => d.startsWith(currentMonthStr)).length;
      const currConsistency = Math.round((currCount / daysPassedInCurrentMonth) * 100);
      const diff = currConsistency - prevConsistency;
      return { ...habit, prevConsistency, currConsistency, diff };
  }).sort((a, b) => a.diff - b.diff).slice(0, 10);


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER & FORM */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <TrendingUp className="text-blue-600" /> Habit Analytics
           </h1>
           <p className="text-sm text-gray-500">Track your goals and progress.</p>
        </div>
        
        <form onSubmit={handleSubmit} className={`flex gap-2 w-full md:w-auto p-2 rounded-xl shadow-sm border ${editId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
            <input type="text" placeholder="Habit Name..." className="p-2 border-none outline-none focus:ring-0 w-full md:w-64 bg-transparent"
                value={newHabit} onChange={(e) => setNewHabit(e.target.value)} />
            <div className="flex items-center border-l border-gray-300 pl-2 gap-1">
                <span className="text-xs text-gray-500 font-bold">GOAL:</span>
                <input type="number" placeholder="21" className="w-12 p-1 border border-gray-200 rounded text-center outline-none"
                    value={newTarget} onChange={(e) => setNewTarget(e.target.value)} />
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

      {/* TOP CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4">Weekly Trend</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="completed" stroke="#4F46E5" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="font-bold text-gray-700 mb-4 self-start w-full">Daily Progress</h3>
            <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={donutData} innerRadius={60} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270}>
                            {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{completionRate}%</span>
                    <span className="text-xs text-gray-400">TODAY</span>
                </div>
            </div>
        </div>
      </div>

      {/* WEEKLY GRID */}
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
                        const target = habit.target || 21;
                        const currentViewMonth = viewDate.toISOString().slice(0, 7); 
                        const daysInViewMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
                        const completedInViewMonth = habit.completedDates.filter(d => d.startsWith(currentViewMonth)).length;
                        const isGoalReached = completedInViewMonth >= target;

                        return (
                            <tr key={habit._id} className="hover:bg-gray-50 transition">
                                <td className="p-4 border border-gray-200 text-center text-gray-500 font-medium">{index + 1}</td>
                                <td className="p-4 border border-gray-200 font-medium text-gray-800">{habit.title}</td>
                                <td className="p-4 border border-gray-200 text-center text-gray-500 font-bold bg-gray-50">{target}</td>
                                {weekDays.map(date => (
                                    <td key={date} className={`p-2 border border-gray-200 text-center ${date === today ? 'bg-blue-50' : ''}`}>
                                        <input type="checkbox" checked={habit.completedDates.includes(date)} onChange={() => toggleHabitDate(habit._id, date)} className="w-5 h-5 accent-blue-600 cursor-pointer rounded" />
                                    </td>
                                ))}
                                <td className="p-4 border border-gray-200 text-center">
                                    <span className="font-bold text-blue-600 text-lg">{completedInViewMonth}</span>
                                    <span className="text-gray-400 text-sm"> / {daysInViewMonth}</span>
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
                                        <button onClick={() => handleEdit(habit)} className="text-gray-400 hover:text-blue-500" title="Edit"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => deleteHabit(habit._id)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- MONTHLY PROGRESS OVERVIEW (Redesigned) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" /> Monthly Progress Overview
            </h3>
            <input type="month" value={leaderboardMonth} onChange={(e) => setLeaderboardMonth(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             
             {/* LEFT: REDESIGNED MONTH SUMMARY CARD */}
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg lg:col-span-1 flex flex-col justify-between">
                 <div>
                     <div className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wide">Summary</div>
                     <h4 className="text-2xl font-bold mb-4">{new Date(leaderboardMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                     
                     <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-5 h-5 text-indigo-200" />
                        <span className="text-lg font-medium">{habits.length} Habits Active</span>
                     </div>
                 </div>
                 
                 <div className="mt-6">
                     <div className="text-6xl font-extrabold tracking-tighter">
                        {monthlyStats.reduce((acc, curr) => acc + curr.completed, 0)}
                     </div>
                     <div className="flex items-center gap-2 text-indigo-100 mt-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">Total Check-ins</span>
                     </div>
                 </div>
             </div>

             {/* RIGHT: Bar Chart & Detailed Table */}
             <div className="lg:col-span-3 flex flex-col h-full">
                 <div className="h-48 w-full mb-6">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={monthlyStats}>
                             <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill:'#9CA3AF'}} interval={0} />
                             <Tooltip cursor={{fill: '#EEF2FF'}} contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                             <Bar dataKey="completed" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={12} />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>

                 {/* DETAILED TABLE WITH STICKY COLUMN */}
                 <div className="flex-1 overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                     <table className="w-full text-center border-collapse min-w-[800px]">
                         <tbody className="text-xs text-gray-600">
                             <tr className="border-b border-gray-100 group hover:bg-gray-50">
                                 <td className="p-3 font-bold text-left bg-gray-50 text-gray-700 w-24 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 border-r border-gray-200">Completed</td>
                                 {monthlyStats.map(stat => <td key={stat.date} className="p-2 min-w-[40px] group-hover:font-bold text-indigo-600">{stat.completed}</td>)}
                             </tr>
                             <tr className="border-b border-gray-100 group hover:bg-gray-50">
                                 <td className="p-3 font-bold text-left bg-gray-50 text-gray-700 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 border-r border-gray-200">Goal</td>
                                 {monthlyStats.map(stat => <td key={stat.date} className="p-2 min-w-[40px] text-gray-400">{stat.goal}</td>)}
                             </tr>
                             <tr className="border-b border-gray-100 group hover:bg-gray-50">
                                 <td className="p-3 font-bold text-left bg-gray-50 text-gray-700 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 border-r border-gray-200">Left</td>
                                 {monthlyStats.map(stat => <td key={stat.date} className="p-2 min-w-[40px] text-red-400 group-hover:text-red-500">{stat.left}</td>)}
                             </tr>
                             <tr className="bg-indigo-50 group">
                                 <td className="p-3 font-bold text-left bg-indigo-100 text-indigo-900 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 border-r border-indigo-200">Daily %</td>
                                 {monthlyStats.map(stat => <td key={stat.date} className="p-2 min-w-[40px] font-medium text-indigo-700 group-hover:font-bold">{stat.percent}%</td>)}
                             </tr>
                         </tbody>
                     </table>
                 </div>
             </div>
          </div>
      </div>

      {/* --- GRID SPLIT: LEADERBOARD & PERFORMANCE (BALANCED) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: MONTHLY LEADERBOARD (Top 10) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Monthly Top 10
              </h3>
              <div className="space-y-4 flex-1">
                {topHabitsMonthly.map((habit, index) => {
                    const consistency = Math.round((habit.monthlyCount / daysInLeaderboardMonth) * 100); 
                    return (
                        <div key={habit._id}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{index + 1}. {habit.title}</span>
                                <span className="font-bold text-gray-900">{habit.monthlyCount} Days <span className="text-gray-400 font-normal">({consistency}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${consistency}%` }}></div>
                            </div>
                        </div>
                    )
                })}
                {topHabitsMonthly.length === 0 && <div className="text-center py-10 text-gray-400">No data available for this month.</div>}
              </div>
          </div>

          {/* RIGHT: PERFORMANCE AUDIT (Top 10 Movers) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <AlertCircle className="w-5 h-5 text-purple-600" /> Action Required (Top 10 Declines)
              </h3>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-purple-50 text-purple-900 text-xs uppercase tracking-wider">
                            <th className="p-4 border-b border-purple-100">Habit</th>
                            <th className="p-4 border-b border-purple-100 text-center">Last Mo.</th>
                            <th className="p-4 border-b border-purple-100 text-center">This Mo.</th>
                            <th className="p-4 border-b border-purple-100 text-center">Change</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {auditData.map((habit) => {
                            const isImprovement = habit.diff >= 0;
                            return (
                                <tr key={habit._id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                    <td className="p-4 font-medium text-gray-800">{habit.title}</td>
                                    <td className="p-4 text-center text-gray-500">{habit.prevConsistency}%</td>
                                    <td className="p-4 text-center font-bold text-gray-800">{habit.currConsistency}%</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center gap-1 font-bold ${isImprovement ? 'text-green-600' : 'text-red-500'}`}>
                                            {isImprovement ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}{Math.abs(habit.diff)}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {auditData.length === 0 && (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-400">No performance data yet.</td></tr>
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      </div>

    </div>
  );
};

export default Habits;