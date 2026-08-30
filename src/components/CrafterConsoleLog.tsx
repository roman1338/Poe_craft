import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export interface LogEntry {
  id: number;
  time: string;
  text: string;
  type: 'info' | 'alt' | 'aug' | 'success' | 'warn';
}

interface CrafterConsoleLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const CrafterConsoleLog: React.FC<CrafterConsoleLogProps> = ({ logs, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#121620] border-t border-[#273043] h-28 flex flex-col text-xs font-mono select-none">
      <div className="flex items-center justify-between px-2.5 py-1 bg-[#191f2c] border-b border-[#273043] text-[11px]">
        <div className="flex items-center gap-1.5 text-[#94a3b8]">
          <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="font-bold text-white">Console Log Output</span>
          <span className="text-[10px] text-[#64748b]">({logs.length} entries)</span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-[#64748b] hover:text-[#f87171] flex items-center gap-1 text-[10px]"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div ref={containerRef} className="flex-1 p-2 overflow-y-auto space-y-0.5 text-[11px]">
        {logs.length === 0 ? (
          <div className="text-[#64748b]">Log is currently empty. Press [Start craft] or F1 to begin.</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="flex items-start gap-1.5 leading-tight">
              <span className="text-[#64748b] text-[10px] shrink-0">[{l.time}]</span>
              <span
                className={`truncate ${
                  l.type === 'success'
                    ? 'text-[#98c379] font-bold'
                    : l.type === 'warn'
                    ? 'text-[#f59e0b]'
                    : l.type === 'aug'
                    ? 'text-[#c084fc]'
                    : l.type === 'alt'
                    ? 'text-[#38bdf8]'
                    : 'text-[#cbd5e1]'
                }`}
              >
                {l.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
