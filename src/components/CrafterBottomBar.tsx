import React from 'react';
import { Play, Square, Crosshair, RotateCcw } from 'lucide-react';

interface CrafterBottomBarProps {
  isRunning: boolean;
  onStartCraft: () => void;
  onStopCraft: () => void;
  onSetAlt: () => void;
  onSetItem: () => void;
  onCleanArea: () => void;
}

export const CrafterBottomBar: React.FC<CrafterBottomBarProps> = ({
  isRunning,
  onStartCraft,
  onStopCraft,
  onSetAlt,
  onSetItem,
  onCleanArea,
}) => {
  return (
    <div className="bg-[#161a25] border-t border-[#273043] p-2 grid grid-cols-2 sm:grid-cols-4 gap-2 select-none">
      {/* 1. Set Alt / Orb Pos 1 */}
      <button
        type="button"
        id="bottom-set-alt-btn"
        onClick={onSetAlt}
        className="py-2.5 px-3 bg-[#1e2536] hover:bg-[#283248] border border-[#313e59] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
      >
        <Crosshair className="w-3.5 h-3.5 text-[#38bdf8]" />
        <span>Set Alt [F7]</span>
      </button>

      {/* 2. Set Item */}
      <button
        type="button"
        id="bottom-set-item-btn"
        onClick={onSetItem}
        className="py-2.5 px-3 bg-[#1e2536] hover:bg-[#283248] border border-[#313e59] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
      >
        <Crosshair className="w-3.5 h-3.5 text-[#e5c07b]" />
        <span>Set Item [F6]</span>
      </button>

      {/* 3. Start / Stop Craft */}
      <button
        type="button"
        id="bottom-start-craft-btn"
        onClick={isRunning ? onStopCraft : onStartCraft}
        className={`py-2.5 px-3 border font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
          isRunning
            ? 'bg-[#7f1d1d] hover:bg-[#991b1b] border-[#dc2626] text-white'
            : 'bg-[#1872b8] hover:bg-[#1f7ec8] border-[#3891d4] text-white'
        }`}
      >
        {isRunning ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop craft [F9]</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start craft [F8]</span>
          </>
        )}
      </button>

      {/* 4. Clean Area / Reset */}
      <button
        type="button"
        id="bottom-clean-area-btn"
        onClick={onCleanArea}
        className="py-2.5 px-3 bg-[#1e2536] hover:bg-[#283248] border border-[#313e59] text-[#cbd5e1] hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[#94a3b8]" />
        <span>Clean area</span>
      </button>
    </div>
  );
};
