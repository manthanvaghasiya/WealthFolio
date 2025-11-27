import React, { useState, useEffect } from 'react';
import API from '../services/api';

// IMPORT COMPONENTS
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    try {
      if (editId) {
        // UPDATE Logic
        const res = await API.put(`/habits/${editId}`, { title: newHabit, target: Number(newTarget) });
        // Update local state immediately (Fix for "Not Saving" issue)
        setHabits(prev => prev.map(h => h._id === editId ? res.data : h));
        setEditId(null); 
      } else {
        // ADD Logic
        const res = await API.post('/habits', { title: newHabit, target: Number(newTarget) });
        setHabits(prev => [res.data, ...prev]);
      }
      setNewHabit(''); setNewTarget(21);
    } catch (err) { alert("Error saving. Check console."); }
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
    try { await API.put(`/habits/${id}/toggle`, { date }); } catch (err) { fetchHabits(); }
  };

  const deleteHabit = async (id) => {
    if(!window.confirm("Delete?")) return;
    try { await API.delete(`/habits/${id}`); setHabits(prev => prev.filter(h => h._id !== id)); } catch (err) {}
  };

  const handlePrevWeek = () => {
    const newDate = new Date(viewDate); newDate.setDate(viewDate.getDate() - 7); setViewDate(newDate);
  };
  const handleNextWeek = () => {
    const newDate = new Date(viewDate); newDate.setDate(viewDate.getDate() + 7); setViewDate(newDate);
  };

  // --- DATA CALCULATIONS ---
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const completionRate = habits.length === 0 ? 0 : Math.round((completedToday / habits.length) * 100);
  
  const donutData = [ { name: 'Done', value: completedToday, color: '#10B981' }, { name: 'Left', value: habits.length - completedToday, color: '#E5E7EB' } ];
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

  const topHabitsMonthly = habits.map(habit => ({
      ...habit, monthlyCount: habit.completedDates.filter(d => d.startsWith(leaderboardMonth)).length
  })).sort((a, b) => b.monthlyCount - a.monthlyCount).slice(0, 10);

  const currentMonthStr = new Date().toISOString().slice(0, 7); 
  const prevDateObj = new Date(); prevDateObj.setMonth(prevDateObj.getMonth() - 1);
  const prevMonthStr = prevDateObj.toISOString().slice(0, 7); 
  const daysPassedInCurrentMonth = new Date().getDate(); 
  const totalDaysInPrevMonth = new Date(prevDateObj.getFullYear(), prevDateObj.getMonth() + 1, 0).getDate(); 

  const auditData = habits.map(habit => {
      const prevC = Math.round((habit.completedDates.filter(d => d.startsWith(prevMonthStr)).length / totalDaysInPrevMonth) * 100);
      const currC = Math.round((habit.completedDates.filter(d => d.startsWith(currentMonthStr)).length / daysPassedInCurrentMonth) * 100);
      return { ...habit, prevConsistency: prevC, currConsistency: currC, diff: currC - prevC };
  }).sort((a, b) => a.diff - b.diff).slice(0, 10);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <HabitForm 
        handleSubmit={handleSubmit} newHabit={newHabit} setNewHabit={setNewHabit}
        newTarget={newTarget} setNewTarget={setNewTarget} editId={editId} cancelEdit={cancelEdit}
      />
      <HabitStats trendData={trendData} donutData={donutData} completionRate={completionRate} />
      <HabitGrid 
        habits={habits} weekDays={weekDays} today={today} 
        handlePrevWeek={handlePrevWeek} handleNextWeek={handleNextWeek} 
        toggleHabitDate={toggleHabitDate} handleEdit={handleEdit} deleteHabit={deleteHabit} 
      />
      <HabitMonthlyOverview 
        leaderboardMonth={leaderboardMonth} setLeaderboardMonth={setLeaderboardMonth} 
        monthlyStats={monthlyStats} activeHabitsCount={habits.length} avgDailyConsistency={avgDailyConsistency} 
      />
      <HabitAnalysis 
        topHabitsMonthly={topHabitsMonthly} auditData={auditData} daysInLeaderboardMonth={selectedMonthDays.length} 
      />
    </div>
  );
};

export default Habits;