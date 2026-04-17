
import React, { useEffect, useRef, useState } from 'react';
import { ExerciseType } from '../types';
import { RepCounter } from '../services/poseEngine';

interface CameraTrackerProps {
  exercise: ExerciseType;
  onRep: (count: number, quality: number, feedback: string) => void;
  onFinish: () => void;
  feedback: string;
}

const CameraTracker: React.FC<CameraTrackerProps> = ({ exercise, onRep, onFinish, feedback }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [localRepCount, setLocalRepCount] = useState(0);
  const [localQuality, setLocalQuality] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  const isCalibratedRef = useRef(false);
  const repCountRef = useRef(0);
  const feedbackRef = useRef('');
  const qualityRef = useRef(0);
  const showSkeletonRef = useRef(true);
  const counterRef = useRef<RepCounter>(new RepCounter(exercise));
  const calibrationRef = useRef({ progress: 0, lastUpdate: Date.now() });

  // Sync ref for callback performance
  useEffect(() => {
    showSkeletonRef.current = showSkeleton;
  }, [showSkeleton]);

  const checkTPose = (landmarks: any): boolean => {
    if (!landmarks || landmarks.length < 17) return false;
    
    const lSh = landmarks[11], rSh = landmarks[12], lEl = landmarks[13], rEl = landmarks[14], lWr = landmarks[15], rWr = landmarks[16];
    const yT = 0.15;
    const lH = Math.abs(lSh.y - lEl.y) < yT && Math.abs(lEl.y - lWr.y) < yT;
    const rH = Math.abs(rSh.y - rEl.y) < yT && Math.abs(rEl.y - rWr.y) < yT;
    const isExtended = Math.abs(lWr.x - rWr.x) > (Math.abs(lSh.x - rSh.x) * 1.8);
    return lH && rH && isExtended && lWr.visibility > 0.4 && rWr.visibility > 0.4;
  };

  useEffect(() => {
    let isActive = true;
    let camera: any = null;
    let pose: any = null;

    const initializeMediaPipe = async () => {
      try {
        pose = new (window as any).Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 0,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results: any) => {
          if (!isActive || !canvasRef.current || !results) return;
          const canvasCtx = canvasRef.current.getContext('2d', { alpha: false });
          if (!canvasCtx) return;

          canvasCtx.save();
          canvasCtx.fillStyle = '#0f172a';
          canvasCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          if (results.poseLandmarks) {
            if (!isCalibratedRef.current) {
              const holding = checkTPose(results.poseLandmarks);
              const now = Date.now(), delta = now - calibrationRef.current.lastUpdate;
              calibrationRef.current.lastUpdate = now;

              if (holding) {
                calibrationRef.current.progress = Math.min(100, calibrationRef.current.progress + (delta / 15)); 
                if (calibrationRef.current.progress >= 100) {
                  isCalibratedRef.current = true;
                  setIsCalibrated(true);
                  if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Begin"));
                }
              } else {
                calibrationRef.current.progress = Math.max(0, calibrationRef.current.progress - (delta / 10));
              }
              setCalibrationProgress(Math.floor(calibrationRef.current.progress));
            } else {
              const { count, feedback: f, quality: q } = counterRef.current.process(results.poseLandmarks);
              
              if (count !== repCountRef.current || f !== feedbackRef.current || q !== qualityRef.current) {
                const isNewRep = count !== repCountRef.current;
                repCountRef.current = count;
                feedbackRef.current = f;
                qualityRef.current = q;
                
                setLocalRepCount(count);
                setLocalQuality(q);
                onRep(count, q, f);
                
                if (isNewRep && 'speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(count.toString());
                  utterance.rate = 2.0;
                  window.speechSynthesis.speak(utterance);
                }
              }
            }

            if (showSkeletonRef.current) {
              const accentColor = isCalibratedRef.current ? '#22d3ee' : '#fbbf24';
              (window as any).drawConnectors(canvasCtx, results.poseLandmarks, (window as any).POSE_CONNECTIONS, {
                color: isCalibratedRef.current ? accentColor : '#ffffff20',
                lineWidth: 2,
              });
              (window as any).drawLandmarks(canvasCtx, results.poseLandmarks, {
                color: isCalibratedRef.current ? '#f43f5e' : '#ffffff40',
                lineWidth: 1,
                radius: 2,
              });
            }
          }
          canvasCtx.restore();
          if (isInitializing) setIsInitializing(false);
        });

        if (videoRef.current) {
          camera = new (window as any).Camera(videoRef.current, {
            onFrame: async () => {
              if (isActive && videoRef.current && pose) await pose.send({ image: videoRef.current });
            },
            width: 640,
            height: 480,
          });
          await camera.start();
        }
      } catch (err) { console.error(err); }
    };

    initializeMediaPipe();
    return () => {
      isActive = false;
      if (camera) camera.stop();
      if (pose) try { pose.close(); } catch(e) {}
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [exercise, onRep]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none opacity-60" />

      {!isCalibrated && !isInitializing && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-md">
          <div className="max-w-md w-full px-8 text-center">
            <div className="mb-8 relative flex justify-center items-center">
               <div className="relative">
                 <svg className="w-40 h-40 text-cyan-400/20 animate-pulse" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 20c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5zM15 35h70v8H15zM45 45h10v35H45z" />
                 </svg>
                 <svg className="absolute inset-0 w-40 h-40 -rotate-90">
                    <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-white/5" transform="scale(2.5)" />
                    <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="2" strokeDasharray={113} strokeDashoffset={113 - (113 * calibrationProgress) / 100} className="text-cyan-400 transition-all duration-100" transform="scale(2.5)" strokeLinecap="round" />
                 </svg>
               </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">Initializing Vision</h2>
            <p className="text-slate-400 text-sm mb-8 px-6">Hold a <span className="text-cyan-400 font-bold">T-Pose</span> to begin tracking.</p>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-500 transition-all duration-100" style={{ width: `${calibrationProgress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {isInitializing && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
          <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-cyan-400 font-black tracking-widest uppercase text-[10px]">Optimizing Engine...</p>
        </div>
      )}

      {isCalibrated && (
        <div className="absolute top-0 left-0 w-full p-6 z-30 flex justify-between items-start pointer-events-none">
          <div className="bg-slate-950/60 backdrop-blur-md border border-white/5 p-5 rounded-3xl min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black">Live Tracking</div>
              <button 
                onClick={() => setShowSkeleton(!showSkeleton)} 
                className="pointer-events-auto p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                title="Toggle Skeleton Visualization"
              >
                <svg className={`w-4 h-4 ${showSkeleton ? 'text-cyan-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <div className="text-2xl font-black text-white uppercase">{exercise.replace('_', ' ')}</div>
            <div className="mt-4 text-xs font-bold text-cyan-400 uppercase tracking-widest">{feedback || 'Move into position'}</div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="bg-slate-950/60 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] text-right min-w-[140px]">
              <div className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black mb-1">Reps</div>
              <div className="text-6xl font-mono font-black text-white leading-none">{localRepCount}</div>
            </div>
            <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-4 py-2 rounded-xl text-right">
               <div className="text-emerald-500/40 text-[8px] uppercase font-black mb-0.5">Precision</div>
               <div className="text-lg font-mono font-black text-emerald-400">{localQuality}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-10 right-10 z-40">
        {isCalibrated && (
          <button onClick={onFinish} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-transform active:scale-95 pointer-events-auto">
            End Session
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraTracker;
