export type ItemType = 'star' | 'crystal' | 'gem' | 'heart' | 'clock' | 'bomb';

export interface FallingItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  points: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  scale: number;
  vy: number;
}

export interface StarBackground {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface GameStats {
  score: number;
  highScore: number;
  lives: number;
  combo: number;
  maxCombo: number;
  level: number;
  itemsCaught: number;
  bombsHit: number;
  slowMoActive: boolean;
  slowMoRemaining: number;
}
