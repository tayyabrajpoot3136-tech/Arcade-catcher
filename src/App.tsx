import { useState, useEffect, useCallback } from 'react';
import type { GameStatus, GameStats } from './types';
import { sounds } from './utils/audio';
import { ArcadeCanvas } from './components/ArcadeCanvas';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { TouchControls } from './components/TouchControls';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('arcade_catcher_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('arcade_catcher_high');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    lives: 3,
    combo: 1,
    maxCombo: 1,
    level: 1,
    itemsCaught: 0,
    bombsHit: 0,
    slowMoActive: false,
    slowMoRemaining: 0,
  });

  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [touchLeft, setTouchLeft] = useState<boolean>(false);
  const [touchRight, setTouchRight] = useState<boolean>(false);

  // Sync initial high score
  useEffect(() => {
    setStats((prev) => ({ ...prev, highScore }));
  }, [highScore]);

  // Start new game
  const startGame = useCallback(() => {
    setIsNewHigh(false);
    setStats({
      score: 0,
      highScore,
      lives: 3,
      combo: 1,
      maxCombo: 1,
      level: 1,
      itemsCaught: 0,
      bombsHit: 0,
      slowMoActive: false,
      slowMoRemaining: 0,
    });
    setStatus('playing');
    sounds.playCatch();
  }, [highScore]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'playing') return 'paused';
      if (prev === 'paused') return 'playing';
      return prev;
    });
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    setStatus('gameover');
    setStats((currentStats) => {
      const isNew = currentStats.score > currentStats.highScore;
      if (isNew) {
        setIsNewHigh(true);
        setHighScore(currentStats.score);
        localStorage.setItem('arcade_catcher_high', String(currentStats.score));
        return { ...currentStats, highScore: currentStats.score };
      }
      return currentStats;
    });
  }, []);

  // Toggle sound
  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (status === 'idle' || status === 'gameover') {
          e.preventDefault();
          startGame();
        }
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (status === 'playing' || status === 'paused') {
          e.preventDefault();
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, startGame, togglePause]);

  return (
    <main
      id="arcade-app-root"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-950 text-slate-100 p-2 sm:p-4 select-none overflow-hidden"
    >
      {/* Outer Arcade Cabinet Frame */}
      <div
        id="arcade-cabinet-screen"
        className="relative w-full max-w-2xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] max-h-[860px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-[0_0_50px_rgba(30,27,75,0.4)] flex flex-col"
      >
        {/* Top HUD */}
        <GameHUD
          stats={stats}
          isPaused={status === 'paused'}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onTogglePause={togglePause}
        />

        {/* Canvas Game Stage */}
        <div className="flex-1 relative w-full h-full">
          <ArcadeCanvas
            status={status}
            stats={stats}
            onUpdateStats={setStats}
            onGameOver={handleGameOver}
            touchMoveLeft={touchLeft}
            touchMoveRight={touchRight}
          />

          {/* Touch Controls (Mobile) */}
          {status === 'playing' && (
            <TouchControls
              onMoveLeftStart={() => setTouchLeft(true)}
              onMoveLeftEnd={() => setTouchLeft(false)}
              onMoveRightStart={() => setTouchRight(true)}
              onMoveRightEnd={() => setTouchRight(false)}
            />
          )}

          {/* Overlays */}
          {status === 'idle' && (
            <StartScreen highScore={highScore} onStart={startGame} />
          )}

          {status === 'paused' && (
            <PauseModal onResume={togglePause} onRestart={startGame} />
          )}

          {status === 'gameover' && (
            <GameOverModal
              stats={stats}
              isNewHigh={isNewHigh}
              onRestart={startGame}
            />
          )}
        </div>
      </div>
    </main>
  );
}
