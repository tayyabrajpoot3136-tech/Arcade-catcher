import React from 'react';
import { Play, Sparkles, Heart, Zap, Bomb, Trophy, Keyboard, MousePointer } from 'lucide-react';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  onStart,
}) => {
  return (
    <div
      id="start-screen-backdrop"
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div
        id="start-card"
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Retro Arcade</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          Arcade Catcher
        </h1>
        <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">
          Catch falling gems and power-ups with your collector paddle. Dodge the bombs!
        </p>

        {/* High score callout if > 0 */}
        {highScore > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold mb-5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>High Score: {highScore.toLocaleString()}</span>
          </div>
        )}

        {/* Items legend */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 mb-5 text-left text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Items & Hazards
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] inline-block" />
              <span>Star <strong className="text-amber-300">+10 pts</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] inline-block" />
              <span>Crystal <strong className="text-cyan-300">+25 pts</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] inline-block" />
              <span>Gem <strong className="text-emerald-300">+50 pts</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Heart <strong className="text-rose-300">+1 Life</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Clock <strong className="text-indigo-300">Slow-Mo</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Bomb className="w-3.5 h-3.5 text-red-500" />
              <span>Bomb <strong className="text-red-400">-1 Life</strong></span>
            </div>
          </div>
        </div>

        {/* Controls legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-6">
          <div className="flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-slate-300" />
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">A</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">D</kbd> or <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">←</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">→</kbd></span>
          </div>
          <div className="flex items-center gap-1.5">
            <MousePointer className="w-4 h-4 text-slate-300" />
            <span>Mouse or Touch</span>
          </div>
        </div>

        {/* Start Button */}
        <button
          id="start-game-btn"
          type="button"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-base tracking-wide shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Playing</span>
        </button>

        <p className="mt-3 text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> to launch
        </p>
      </div>
    </div>
  );
};
