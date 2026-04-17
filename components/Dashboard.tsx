
import React, { useState } from 'react';
import { ExerciseType, WorkoutSession, EXERCISE_LIST } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  onStart: (exercise: ExerciseType) => void;
  history: WorkoutSession[];
}

const Dashboard: React.FC<DashboardProps> = ({ onStart, history }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Legs', 'Push', 'Cardio'];

  const filteredExercises = activeCategory === 'All' 
    ? EXERCISE_LIST 
    : EXERCISE_LIST.filter(ex => ex.category === activeCategory);

  const totalReps = history.reduce((acc, sess) => acc + sess.reps, 0);
  const avgQuality = history.length > 0 
    ? Math.round(history.reduce((acc, sess) => acc + sess.qualityScore, 0) / history.length) 
    : 0;

  const chartData = history.slice(0, 7).reverse().map(h => ({
    name: new Date(h.startTime).toLocaleDateString([], { weekday: 'short' }),
    reps: h.reps,
    quality: h.qualityScore
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent uppercase">
            PULSE<span className="text-white">VISION</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-wide">Automated Computer Vision Strength Tracking</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 min-w-[140px] shadow-xl">
              <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Total Volume</div>
              <div className="text-3xl font-mono font-black text-white">{totalReps} <span className="text-xs text-slate-500">REPS</span></div>
           </div>
           <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 min-w-[140px] shadow-xl">
              <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Avg Precision</div>
              <div className="text-3xl font-mono font-black text-emerald-400">{avgQuality}%</div>
           </div>
        </div>
      </header>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Choose Movement</h2>
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((ex) => (
            <button
              key={ex.type}
              onClick={() => onStart(ex.type)}
              className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-8 text-left transition-all hover:-translate-y-2 hover:bg-slate-900/60 hover:border-cyan-500/30 shadow-2xl"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${ex.color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity`}></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {ex.icon}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-cyan-400 transition-colors">
                  {ex.category}
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-cyan-400 transition-colors">{ex.label}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">{ex.description}</p>
              
              <div className="flex items-center gap-2 text-cyan-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Engage Tracker
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Velocity Performance</h3>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last 7 Sessions</div>
          </div>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} fontSize={10} tickMargin={10} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} fontSize={10} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px', fontSize: '12px' }}
                    itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="reps" radius={[8, 8, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm font-bold uppercase tracking-widest italic bg-slate-950/20 rounded-3xl border border-dashed border-white/5">
                No active session logs found.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Recent Log</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {history.length > 0 ? history.map((sess) => (
              <div key={sess.id} className="group flex items-center justify-between p-5 bg-slate-950/40 rounded-3xl border border-white/5 hover:border-cyan-500/20 transition-all">
                <div>
                  <div className="font-black text-slate-100 text-sm uppercase tracking-tight">{sess.exercise.replace('_', ' ')}</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{new Date(sess.startTime).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-black text-cyan-400">{sess.reps}</div>
                  <div className="text-[9px] text-emerald-500 uppercase font-black tracking-widest">{sess.qualityScore}% Precision</div>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                 <div className="text-slate-700 text-4xl mb-4">🌑</div>
                 <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest">Awaiting First Set</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
