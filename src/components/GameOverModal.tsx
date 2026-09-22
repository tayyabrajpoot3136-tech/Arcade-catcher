import React from 'react';
import { RotateCcw, Trophy, Flame, Sparkles, ShieldAlert } from 'lucide-react';
import type { GameStats } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  isNewHigh: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isNewHigh,
  onRestart,
}) => {
  return (
    <div
      id="game-over-modal-backdrop"
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300"
    >
      <div
        id="game-over-card"
        className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {isNewHigh ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New High Score!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Game Over</span>
          </div>
        )}

        <h2 className="text-3xl font-black tracking-tight text-white mb-1">
          {stats.score.toLocaleString()}
        </h2>
        <p className="text-xs text-slate-400 font-medium mb-6">Final Score</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Best Score</span>
            </div>
            <div className="text-base font-mono font-bold text-white">
              {stats.highScore.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Max Combo</span>
            </div>
            <div className="text-base font-mono font-bold text-white">
              {stats.maxCombo}x
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 mb-1">
              Crystals Caught
            </div>
            <div className="text-base font-mono font-bold text-emerald-400">
              {stats.itemsCaught}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 mb-1">
              Hazards Hit
            </div>
            <div className="text-base font-mono font-bold text-rose-400">
              {stats.bombsHit}
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          id="play-again-btn"
          type="button"
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>

        <p className="mt-3 text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</kbd> to restart
        </p>
      </div>
    </div>
  );
};
