
export enum ExerciseType {
  SQUAT = 'SQUAT',
  BARBELL_SQUAT = 'BARBELL_SQUAT',
  PUSHUP = 'PUSHUP',
  DUMBBELL_PRESS = 'DUMBBELL_PRESS',
  JUMPING_JACK = 'JUMPING_JACK',
  UNKNOWN = 'UNKNOWN'
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface WorkoutSession {
  id: string;
  startTime: number;
  endTime?: number;
  exercise: ExerciseType;
  reps: number;
  qualityScore: number;
  feedback: string[];
}

export interface AppState {
  isTracking: boolean;
  currentExercise: ExerciseType;
  reps: number;
  lastRepTime: number;
  history: WorkoutSession[];
  isSummaryOpen: boolean;
  activeSession?: WorkoutSession;
  currentFeedback: string;
}

export interface ExerciseMetadata {
  type: ExerciseType;
  label: string;
  category: 'Legs' | 'Push' | 'Pull' | 'Cardio';
  description: string;
  icon: string;
  color: string;
}

export const EXERCISE_LIST: ExerciseMetadata[] = [
  {
    type: ExerciseType.SQUAT,
    label: 'Bodyweight Squat',
    category: 'Legs',
    description: 'Standard air squat focusing on depth and posture.',
    icon: '🦵',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    type: ExerciseType.BARBELL_SQUAT,
    label: 'Barbell Squat',
    category: 'Legs',
    description: 'Stricter depth requirements for weighted barbell work.',
    icon: '🏋️‍♂️',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    type: ExerciseType.PUSHUP,
    label: 'Pushup',
    category: 'Push',
    description: 'Chest and triceps engagement with core stability.',
    icon: '💪',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    type: ExerciseType.DUMBBELL_PRESS,
    label: 'Dumbbell Press',
    category: 'Push',
    description: 'Overhead shoulder press tracking vertical arm extension.',
    icon: '🏺',
    color: 'from-orange-500 to-amber-600'
  },
  {
    type: ExerciseType.JUMPING_JACK,
    label: 'Jumping Jack',
    category: 'Cardio',
    description: 'Full body coordination and heart rate boosting.',
    icon: '🏃',
    color: 'from-pink-500 to-rose-600'
  }
];
