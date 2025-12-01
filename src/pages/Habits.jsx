import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Sparkles, CalendarDays, Layers } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Components
import HabitForm from '../components/habits/HabitForm';
import HabitStats from '../components/habits/HabitStats';
import HabitGrid from '../components/habits/HabitGrid';
import HabitMonthlyOverview from '../components/habits/HabitMonthlyOverview';
import HabitAnalysis from '../components/habits/HabitAnalysis';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State
  const [newHabit, setNewHabit] = useState('');
  const [newTarget, setNewTarget] = useState(21);
  const [editId, setEditId] = useState(null); 
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

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try {
      const res = await API.get('/habits');
      setHabits(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    try {
      if (editId) {
        await API.put(`/habits/${editId}`, { title: newHabit, target: Number(newTarget) });
        setEditId(null); 
      } else {
        await API.post('/habits', { title: newHabit, target: Number(newTarget) });
      }
      await fetchHabits();
      setNewHabit(''); setNewTarget(21);
    } catch (err) { alert("Error saving."); }
  };

  const handleEdit = (habit) => {
    setNewHabit(habit.title); setNewTarget(habit.target || 21); setEditId(habit._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditId(null); setNewHabit(''); setNewTarget(21); };

  const toggleHabitDate = async (id, date) => {
    setHabits(prev => prev.map(h => h._id === id ? {
      ...h, completedDates: h.completedDates.includes(date) ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date]
    } : h));
    try { await API.put(`/habits/${id}/toggle`, { date }); } 
    catch (err) { fetchHabits(); } 
  };

  const deleteHabit = async (id) => {
    if(!window.confirm("Delete?")) return;
    try { await API.delete(`/habits/${id}`); setHabits(prev => prev.filter(h => h._id !== id)); } catch (err) {}
  };

  const handlePrevWeek = () => { const newDate = new Date(viewDate); newDate.setDate(viewDate.getDate() - 7); setViewDate(newDate); };
  const handleNextWeek = () => { const newDate = new Date(viewDate); newDate.setDate(viewDate.getDate() + 7); setViewDate(newDate); };

  // --- DATA CALCULATIONS ---
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const completionRate = habits.length === 0 ? 0 : Math.round((completedToday / habits.length) * 100);
  
  const donutData = [ 
    { name: 'Done', value: completedToday, color: '#4F46E5' }, 
    { name: 'Left', value: habits.length - completedToday, color: '#F3F4F6' } 
  ];

  const trendData = weekDays.map(date => ({ name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), completed: habits.filter(h => h.completedDates.includes(date)).length }));

  const getDaysInSelectedMonth = () => {
    const [year, month] = leaderboardMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) { days.push(date.toISOString().slice(0, 10)); date.setDate(date.getDate() + 1); }
    return days;
  };
  const selectedMonthDays = getDaysInSelectedMonth();
  const monthlyStats = selectedMonthDays.map(date => {
    const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
    const goalCount = habits.length; 
    const percentage = goalCount === 0 ? 0 : Math.round((completedCount / goalCount) * 100);
    return { date, day: date.split('-')[2], completed: completedCount, goal: goalCount, left: goalCount - completedCount, percent: percentage };
  });
  const avgDailyConsistency = monthlyStats.length === 0 ? 0 : Math.round(monthlyStats.reduce((acc, curr) => acc + curr.percent, 0) / monthlyStats.length);

  // TOP 7 PERFORMERS
  const topHabitsMonthly = habits.map(habit => ({
      ...habit, monthlyCount: habit.completedDates.filter(d => d.startsWith(leaderboardMonth)).length
  })).sort((a, b) => b.monthlyCount - a.monthlyCount).slice(0, 7); 

  const currentMonthStr = new Date().toISOString().slice(0, 7); 
  const prevDateObj = new Date(); prevDateObj.setMonth(prevDateObj.getMonth() - 1);
  const prevMonthStr = prevDateObj.toISOString().slice(0, 7); 
  const daysPassedInCurrentMonth = new Date().getDate(); 
  const totalDaysInPrevMonth = new Date(prevDateObj.getFullYear(), prevDateObj.getMonth() + 1, 0).getDate(); 

  // TOP 7 DECLINES (Action Required)
  const auditData = habits.map(habit => {
      const prevC = Math.round((habit.completedDates.filter(d => d.startsWith(prevMonthStr)).length / totalDaysInPrevMonth) * 100);
      const currC = Math.round((habit.completedDates.filter(d => d.startsWith(currentMonthStr)).length / daysPassedInCurrentMonth) * 100);
      return { ...habit, prevConsistency: prevC, currConsistency: currC, diff: currC - prevC };
  })
  .filter(h => h.diff < 0) // Only negative trends
  .sort((a, b) => a.diff - b.diff) // Sort by biggest drop
  .slice(0, 7); // Changed from 5 to 7

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 pb-20">
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        Habit Mastery <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-200 animate-pulse" />
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 text-base">Consistency is the key to excellence.</p>
                </div>
                <div className="hidden md:flex gap-2">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-600">
                        <CalendarDays className="w-4 h-4 text-indigo-500" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <HabitStats trendData={trendData} />
                    <HabitGrid 
                        habits={habits} weekDays={weekDays} today={today} 
                        handlePrevWeek={handlePrevWeek} handleNextWeek={handleNextWeek} 
                        toggleHabitDate={toggleHabitDate} handleEdit={handleEdit} deleteHabit={deleteHabit} 
                    />
                </div>

                <div className="lg:col-span-1 space-y-8 sticky top-24">
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-indigo-100 border border-indigo-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                            <Layers className="w-5 h-5 text-indigo-600" /> New Ritual
                        </h3>
                        <HabitForm 
                            handleSubmit={handleSubmit} newHabit={newHabit} setNewHabit={setNewHabit}
                            newTarget={newTarget} setNewTarget={setNewTarget} editId={editId} cancelEdit={cancelEdit}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden h-64">
                        <h3 className="font-bold text-gray-800 mb-2 z-10">Daily Progress</h3>
                        <div className="relative w-40 h-40 z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={donutData} innerRadius={55} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                                        {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-extrabold text-indigo-600">{completionRate}%</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ANALYTICS SECTION */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Monthly Performance</h2>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <HabitMonthlyOverview 
                    leaderboardMonth={leaderboardMonth} setLeaderboardMonth={setLeaderboardMonth} 
                    monthlyStats={monthlyStats} activeHabitsCount={habits.length} avgDailyConsistency={avgDailyConsistency} 
                />
                <HabitAnalysis 
                    topHabitsMonthly={topHabitsMonthly} auditData={auditData} daysInLeaderboardMonth={selectedMonthDays.length} 
                />
            </div>
        </div>
    </div>
  );
};

export default Habits;