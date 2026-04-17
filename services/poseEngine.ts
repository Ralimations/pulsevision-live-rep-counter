
import { ExerciseType, Landmark } from '../types';

export const calculateAngle = (a: Landmark, b: Landmark, c: Landmark): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
};

type RepState = 'START' | 'GOING_DOWN' | 'PEAK' | 'GOING_UP';

export class RepCounter {
  private state: RepState = 'START';
  private count: number = 0;
  private qualityPoints: number[] = [];
  private angleBuffer: number[] = [];
  private BUFFER_SIZE = 3; // Reduced for lower latency

  constructor(public exercise: ExerciseType) {}

  private getSmoothedAngle(angle: number): number {
    this.angleBuffer.push(angle);
    if (this.angleBuffer.length > this.BUFFER_SIZE) this.angleBuffer.shift();
    return this.angleBuffer.reduce((a, b) => a + b, 0) / this.angleBuffer.length;
  }

  public process(landmarks: any): { count: number; feedback: string; quality: number } {
    if (!landmarks || landmarks.length < 33) return { count: this.count, feedback: 'Position yourself', quality: 0 };

    let feedback = '';
    const avgQuality = this.qualityPoints.length > 0 
      ? Math.round(this.qualityPoints.reduce((a, b) => a + b, 0) / this.qualityPoints.length)
      : 0;

    switch (this.exercise) {
      case ExerciseType.SQUAT:
      case ExerciseType.BARBELL_SQUAT: {
        const lH = landmarks[23], lK = landmarks[25], lA = landmarks[27];
        const rH = landmarks[24], rK = landmarks[26], rA = landmarks[28];
        const angle = this.getSmoothedAngle(Math.min(calculateAngle(lH, lK, lA), calculateAngle(rH, rK, rA)));

        const peakT = this.exercise === ExerciseType.BARBELL_SQUAT ? 90 : 95;
        if (this.state === 'START' && angle < 140) this.state = 'GOING_DOWN';
        if (this.state === 'GOING_DOWN') {
          if (angle < peakT) { this.state = 'PEAK'; feedback = 'Good depth!'; }
          else feedback = 'Go lower...';
        }
        if (this.state === 'PEAK' && angle > (peakT + 15)) this.state = 'GOING_UP';
        if (this.state === 'GOING_UP' && angle > 165) {
          this.state = 'START';
          this.count++;
          this.qualityPoints.push(Math.min(100, 85 + (peakT - angle) * 0.5));
          feedback = 'Nice rep!';
        }
        break;
      }
      case ExerciseType.PUSHUP: {
        const lS = landmarks[11], lE = landmarks[13], lW = landmarks[15];
        const angle = this.getSmoothedAngle(calculateAngle(lS, lE, lW));
        const bAngle = calculateAngle(lS, landmarks[23], landmarks[27]);
        if (this.state === 'START' && angle < 150) this.state = 'GOING_DOWN';
        if (this.state === 'GOING_DOWN') {
          if (angle < 85) { this.state = 'PEAK'; feedback = 'Full range!'; }
          else feedback = 'Lower chest...';
        }
        if (this.state === 'PEAK' && angle > 100) this.state = 'GOING_UP';
        if (this.state === 'GOING_UP' && angle > 160) {
          this.state = 'START'; this.count++;
          this.qualityPoints.push(bAngle > 155 ? 95 : 70);
          feedback = bAngle > 155 ? 'Perfect!' : 'Keep back straight';
        }
        break;
      }
      case ExerciseType.DUMBBELL_PRESS: {
        const lS = landmarks[11], lE = landmarks[13], lW = landmarks[15];
        const angle = this.getSmoothedAngle(calculateAngle(lS, lE, lW));
        if (this.state === 'START' && angle > 145) { this.state = 'PEAK'; feedback = 'Extension!'; }
        if (this.state === 'PEAK' && angle < 110) { this.state = 'START'; this.count++; this.qualityPoints.push(95); feedback = 'Good rhythm'; }
        if (this.state === 'START' && angle < 80) feedback = 'Drive up!';
        break;
      }
      case ExerciseType.JUMPING_JACK: {
        const up = landmarks[15].y < landmarks[11].y && landmarks[16].y < landmarks[12].y;
        const out = Math.abs(landmarks[28].x - landmarks[27].x) > (Math.abs(landmarks[24].x - landmarks[23].x) * 2);
        if (this.state === 'START' && up && out) { this.state = 'PEAK'; feedback = 'Jump!'; }
        if (this.state === 'PEAK' && !up && !out) { this.state = 'START'; this.count++; this.qualityPoints.push(100); }
        break;
      }
    }

    return { count: this.count, feedback, quality: avgQuality };
  }

  public reset() {
    this.count = 0;
    this.state = 'START';
    this.qualityPoints = [];
    this.angleBuffer = [];
  }
}
