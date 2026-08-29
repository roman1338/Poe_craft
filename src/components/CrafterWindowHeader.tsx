import React from 'react';
import { Minus, Square, X } from 'lucide-react';

interface CrafterWindowHeaderProps {
  currencyUsed: number;
  currencyLimitEnabled: boolean;
  currencyLimit: number;
  onToggleCurrencyLimit: (enabled: boolean) => void;
  onChangeCurrencyLimit: (limit: number) => void;
  showLog: boolean;
  onToggleLog: (show: boolean) => void;
}

export const CrafterWindowHeader: React.FC<CrafterWindowHeaderProps> = ({
  currencyUsed,
  currencyLimitEnabled,
  currencyLimit,
  onToggleCurrencyLimit,
  onChangeCurrencyLimit,
  showLog,
  onToggleLog,
}) => {
  return (
    <div className="bg-[#191f2c] border-b border-[#273043] select-none">
      {/* Title Bar with Cursive Crafter Title and Window Controls */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-[#212838]">
        <div className="flex items-center gap-2">
          <span
            className="text-xl text-white font-bold tracking-wide italic"
            style={{
              fontFamily: "'Dancing Script', 'Brush Script MT', cursive, sans-serif",
            }}
          >
            Crafter
          </span>
          <span className="text-[10px] text-[#64748b] font-mono ml-1">v2.4.8 (poedb)</span>
        </div>

        {/* Windows-style control buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-6 h-5 flex items-center justify-center text-[#94a3b8] hover:bg-[#273043] hover:text-white text-xs transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            className="w-6 h-5 flex items-center justify-center text-[#94a3b8] hover:bg-[#273043] hover:text-white text-xs transition-colors"
            title="Maximize"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            className="w-6 h-5 flex items-center justify-center text-[#94a3b8] hover:bg-[#b91c1c] hover:text-white text-xs transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Subheader: Currency used & Options */}
      <div className="flex items-center justify-between px-3 py-1 text-xs text-[#cbd5e1] bg-[#161a25]">
        <div className="flex items-center gap-2">
          <span className="text-[#94a3b8]">Currency used:</span>
          <span className="font-mono font-bold text-white bg-[#0e1219] px-2 py-0.5 border border-[#273043] text-[11px]">
            {currencyUsed}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#cbd5e1] hover:text-white">
            <input
              type="checkbox"
              checked={currencyLimitEnabled}
              onChange={(e) => onToggleCurrencyLimit(e.target.checked)}
              className="accent-[#1d72b8] w-3.5 h-3.5 cursor-pointer rounded-none"
            />
            <span className="text-[11px]">Currency limit:</span>
          </label>
          <input
            type="number"
            value={currencyLimit}
            onChange={(e) => onChangeCurrencyLimit(parseInt(e.target.value, 10) || 0)}
            disabled={!currencyLimitEnabled}
            className="w-14 bg-[#0e1219] border border-[#273043] px-1 py-0.5 text-right font-mono text-[11px] text-white disabled:opacity-40"
          />

          <label className="flex items-center gap-1.5 cursor-pointer text-[#cbd5e1] hover:text-white">
            <input
              type="checkbox"
              checked={showLog}
              onChange={(e) => onToggleLog(e.target.checked)}
              className="accent-[#1d72b8] w-3.5 h-3.5 cursor-pointer rounded-none"
            />
            <span className="text-[11px]">Log</span>
          </label>
        </div>
      </div>
    </div>
  );
};
