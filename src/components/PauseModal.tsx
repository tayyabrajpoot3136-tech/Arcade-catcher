import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
}) => {
  return (
    <div
      id="pause-modal-backdrop"
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div
        id="pause-card"
        className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center"
      >
        <h3 className="text-2xl font-black tracking-tight text-white mb-2">
          Game Paused
        </h3>
        <p className="text-xs text-slate-400 mb-6">Take a breath or jump right back in</p>

        <div className="flex flex-col gap-2.5">
          <button
            id="resume-btn"
            type="button"
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Resume</span>
          </button>

          <button
            id="restart-pause-btn"
            type="button"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Esc</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">P</kbd> to resume
        </p>
      </div>
    </div>
  );
};
