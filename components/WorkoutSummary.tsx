
import React from 'react';
import { WorkoutSession } from '../types';

interface SummaryProps {
  session: WorkoutSession;
  insights?: {
    summary: string;
    tip: string;
    encouragement: string;
  };
  loadingInsights: boolean;
  onClose: () => void;
}

const WorkoutSummary: React.FC<SummaryProps> = ({ session, insights, loadingInsights, onClose }) => {
  const duration = session.endTime 
    ? Math.round((session.endTime - session.startTime) / 1000) 
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
        
        <div className="p-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Workout Summary</h2>
              <p className="text-slate-400 font-medium">Session ID: <span className="mono text-xs">{session.id}</span></p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full font-bold text-sm border border-emerald-500/20">
              Completed
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-800">
              <div className="text-slate-500 text-xs font-bold uppercase mb-2">Reps</div>
              <div className="text-4xl font-mono font-black text-cyan-400">{session.reps}</div>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-800">
              <div className="text-slate-500 text-xs font-bold uppercase mb-2">Duration</div>
              <div className="text-4xl font-mono font-black text-white">{duration}s</div>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-800">
              <div className="text-slate-500 text-xs font-bold uppercase mb-2">Quality</div>
              <div className="text-4xl font-mono font-black text-emerald-400">{session.qualityScore}%</div>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/50 rounded-3xl p-8 mb-10 relative overflow-hidden">
             {loadingInsights ? (
               <div className="flex items-center gap-4 animate-pulse">
                 <div className="w-12 h-12 bg-slate-800 rounded-full"></div>
                 <div className="space-y-2 flex-1">
                   <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                   <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                 </div>
               </div>
             ) : insights ? (
               <>
                 <div className="absolute top-4 right-6 text-[10px] font-black text-cyan-500/20 uppercase tracking-widest">PulseVision AI Insights</div>
                 <div className="flex gap-6 items-start">
                   <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                   </div>
                   <div>
                     <p className="text-lg text-slate-200 leading-relaxed mb-4 italic">"{insights.summary}"</p>
                     <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">Pro Tip</span>
                        <p className="text-slate-300 text-sm">{insights.tip}</p>
                     </div>
                     <p className="mt-4 text-emerald-400 font-bold">{insights.encouragement}</p>
                   </div>
                 </div>
               </>
             ) : (
               <p className="text-slate-500 italic text-center">AI Insights temporarily unavailable.</p>
             )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-50 hover:bg-white text-slate-950 py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummary;
