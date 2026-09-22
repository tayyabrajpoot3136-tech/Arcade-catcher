import React from 'react';
import { Volume2, VolumeX, Pause, Play, Trophy, Zap, Heart, Flame } from 'lucide-react';
import type { GameStats } from '../types';

interface GameHUDProps {
  stats: GameStats;
  isPaused: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  isPaused,
  soundEnabled,
  onToggleSound,
  onTogglePause,
}) => {
  return (
    <div
      id="game-hud-bar"
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none select-none"
    >
      {/* Left: Score & High Score */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Score
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {stats.score.toLocaleString()}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-amber-300">
          <Trophy className="w-3.5 h-3.5" />
          <span className="text-xs font-mono font-bold">{stats.highScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Middle: Combo Multiplier & SlowMo Status */}
      <div className="flex flex-col items-center">
        {stats.combo > 1 && (
          <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse text-xs font-bold tracking-wide shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{stats.combo}x COMBO</span>
          </div>
        )}

        {stats.slowMoActive && (
          <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono tracking-wider animate-pulse">
            <Zap className="w-3 h-3 text-cyan-300" />
            <span>SLOW-MO {(stats.slowMoRemaining / 1000).toFixed(1)}s</span>
          </div>
        )}
      </div>

      {/* Right: Lives, Sound & Pause Buttons */}
      <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
        {/* Lives (Hearts) */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((heartIndex) => {
            const isFull = heartIndex <= stats.lives;
            return (
              <Heart
                key={heartIndex}
                className={`w-5 h-5 transition-transform duration-300 ${
                  isFull
                    ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'text-slate-700 fill-slate-800 scale-90 opacity-40'
                }`}
              />
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            id="pause-toggle-btn"
            type="button"
            onClick={onTogglePause}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
