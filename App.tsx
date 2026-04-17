
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExerciseType, AppState, WorkoutSession } from './types';
import CameraTracker from './components/CameraTracker';
import Dashboard from './components/Dashboard';
import WorkoutSummary from './components/WorkoutSummary';
import { getWorkoutInsights } from './services/gemini';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isTracking: false,
    currentExercise: ExerciseType.UNKNOWN,
    reps: 0,
    lastRepTime: Date.now(),
    history: [],
    isSummaryOpen: false,
    currentFeedback: '',
  });

  const [insightData, setInsightData] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const handleStartWorkout = (exercise: ExerciseType) => {
    setState(prev => ({
      ...prev,
      isTracking: true,
      currentExercise: exercise,
      reps: 0,
      currentFeedback: 'Initializing Vision...',
      activeSession: {
        id: Math.random().toString(36).substr(2, 9),
        startTime: Date.now(),
        exercise,
        reps: 0,
        qualityScore: 0,
        feedback: []
      }
    }));
  };

  const handleRepDetected = useCallback((count: number, quality: number, feedback: string) => {
    setState(prev => {
      // Smart filter to capture significant feedback for the session history
      const sessionFeedback = prev.activeSession?.feedback || [];
      const updatedFeedback = feedback && 
        feedback.length > 3 && 
        !sessionFeedback.includes(feedback) && 
        !['Position yourself', 'Move into position', 'Ready'].includes(feedback)
          ? [...sessionFeedback, feedback]
          : sessionFeedback;

      return {
        ...prev,
        reps: count,
        currentFeedback: feedback,
        lastRepTime: Date.now(),
        activeSession: prev.activeSession ? {
          ...prev.activeSession,
          reps: count,
          qualityScore: quality,
          feedback: updatedFeedback
        } : undefined
      };
    });
  }, []);

  const handleFinishWorkout = async () => {
    if (!state.activeSession) return;
    
    setLoadingInsights(true);
    const finalSession = {
      ...state.activeSession,
      endTime: Date.now(),
    };

    const insights = await getWorkoutInsights(
      finalSession.reps, 
      finalSession.exercise, 
      finalSession.qualityScore
    );

    setInsightData(insights);
    setLoadingInsights(false);
    
    setState(prev => ({
      ...prev,
      isTracking: false,
      isSummaryOpen: true,
      history: [finalSession, ...prev.history],
      activeSession: finalSession,
      currentFeedback: ''
    }));
  };

  const handleCloseSummary = () => {
    setState(prev => ({ ...prev, isSummaryOpen: false, activeSession: undefined, currentFeedback: '' }));
    setInsightData(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
      {!state.isTracking && !state.isSummaryOpen && (
        <Dashboard 
          history={state.history} 
          onStart={handleStartWorkout} 
        />
      )}

      {state.isTracking && (
        <CameraTracker 
          exercise={state.currentExercise} 
          onRep={handleRepDetected}
          onFinish={handleFinishWorkout}
          feedback={state.currentFeedback}
        />
      )}

      {state.isSummaryOpen && state.activeSession && (
        <WorkoutSummary 
          session={state.activeSession} 
          insights={insightData}
          loadingInsights={loadingInsights}
          onClose={handleCloseSummary} 
        />
      )}
      
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
    </div>
  );
};

export default App;
