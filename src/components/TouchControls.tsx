import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
}) => {
  return (
    <div
      id="touch-controls-bar"
      className="sm:hidden absolute bottom-3 left-0 right-0 z-20 flex justify-between px-6 pointer-events-none select-none"
    >
      <button
        id="touch-btn-left"
        type="button"
        aria-label="Move left"
        onTouchStart={(e) => {
          e.preventDefault();
          onMoveLeftStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onMoveLeftEnd();
        }}
        onMouseDown={onMoveLeftStart}
        onMouseUp={onMoveLeftEnd}
        className="w-16 h-16 rounded-2xl bg-slate-900/80 active:bg-indigo-600/80 border border-slate-700/80 active:border-indigo-400 flex items-center justify-center text-white shadow-xl pointer-events-auto backdrop-blur-sm touch-none transition-transform active:scale-95"
      >
        <ArrowLeft className="w-8 h-8" />
      </button>

      <button
        id="touch-btn-right"
        type="button"
        aria-label="Move right"
        onTouchStart={(e) => {
          e.preventDefault();
          onMoveRightStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onMoveRightEnd();
        }}
        onMouseDown={onMoveRightStart}
        onMouseUp={onMoveRightEnd}
        className="w-16 h-16 rounded-2xl bg-slate-900/80 active:bg-indigo-600/80 border border-slate-700/80 active:border-indigo-400 flex items-center justify-center text-white shadow-xl pointer-events-auto backdrop-blur-sm touch-none transition-transform active:scale-95"
      >
        <ArrowRight className="w-8 h-8" />
      </button>
    </div>
  );
};
