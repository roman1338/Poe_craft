import React, { useState } from 'react';
import { Trash2, Copy, Check, Target, X } from 'lucide-react';
import { CompiledTarget, SelectedTarget } from '../types';
import { ModsDatabase, compileTarget } from '../utils/modsDb';

interface SelectedTargetsProps {
  db: ModsDatabase;
  itemClass: string;
  selected: SelectedTarget[];
  onRemoveTarget: (index: number) => void;
  onClearTargets: () => void;
}

export const SelectedTargets: React.FC<SelectedTargetsProps> = ({
  db,
  itemClass,
  selected,
  onRemoveTarget,
  onClearTargets,
}) => {
  const [copiedRegex, setCopiedRegex] = useState(false);

  const compiledTargets: { target: CompiledTarget | null; raw: SelectedTarget; error?: string }[] =
    selected.map((item) => {
      try {
        const target = compileTarget(db, item.id, itemClass, item.min_tier);
        return { target, raw: item };
      } catch (err) {
        return { target: null, raw: item, error: String(err) };
      }
    });

  const combinedSearchRegex = compiledTargets
    .map((c) => (c.target?.pattern ? `"${c.target.pattern.replace(/#/g, '\\d+')}"` : ''))
    .filter(Boolean)
    .join(' ');

  const handleCopyRegex = () => {
    if (!combinedSearchRegex) return;
    navigator.clipboard.writeText(combinedSearchRegex);
    setCopiedRegex(true);
    setTimeout(() => setCopiedRegex(false), 2000);
  };

  return (
    <fieldset className="border border-[#3a3f4b] bg-[#21252b] p-2.5 flex flex-col text-xs text-[#abb2bf]">
      <legend className="px-1.5 font-bold text-[#d7dae0] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#e5c07b]" />
          <span>2. Target Modifiers for Magic Base</span>
          <span className="text-[10px] font-mono text-[#5c6370]">
            ({selected.length} / 2 max)
          </span>
        </div>
      </legend>

      {/* Target Items Table */}
      <div className="border border-[#3a3f4b] bg-[#14161b] mb-2 min-h-[72px]">
        {selected.length === 0 ? (
          <div className="py-4 text-center text-[#5c6370] text-xs">
            No target modifiers set yet. Click any mod in the browser above to set goals.
          </div>
        ) : (
          <table className="w-full text-xs font-mono border-collapse">
            <thead className="bg-[#1e2229] border-b border-[#2d3139] text-[#5c6370] text-left text-[10px]">
              <tr>
                <th className="w-6 px-1.5 py-1 text-center">#</th>
                <th className="w-12 px-1.5 py-1">Type</th>
                <th className="px-1.5 py-1">Target Stat / Pattern</th>
                <th className="w-20 px-1.5 py-1 text-center">Tier</th>
                <th className="w-14 px-1.5 py-1 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {compiledTargets.map((item, idx) => {
                const { target, raw, error } = item;
                const tierLabel =
                  target?.min_tier === null
                    ? 'Any Tier'
                    : target?.min_tier === 1
                    ? 'T1'
                    : `T1–T${target?.min_tier}`;

                return (
                  <tr key={raw.id} className="border-b border-[#21252b] hover:bg-[#1a1d24]">
                    <td className="px-1.5 py-1 text-center text-[#5c6370] font-bold">
                      {idx + 1}
                    </td>
                    <td className="px-1.5 py-1">
                      <span
                        className={`px-1 text-[10px] ${
                          target?.kind === 'Prefix'
                            ? 'text-[#61afef] bg-[#61afef]/10'
                            : 'text-[#c678dd] bg-[#c678dd]/10'
                        }`}
                      >
                        {target?.kind || 'Mod'}
                      </span>
                    </td>
                    <td className="px-1.5 py-1 font-sans text-xs">
                      <div className="text-[#d7dae0] font-medium truncate">
                        {target?.name || raw.id}
                      </div>
                      {target?.pattern && (
                        <div className="text-[10px] text-[#5c6370] font-mono truncate">
                          regex: "{target.pattern}"
                        </div>
                      )}
                    </td>
                    <td className="px-1.5 py-1 text-center">
                      <span className="px-1.5 py-0.5 bg-[#2c313a] text-[#e5c07b] font-bold text-[10px] border border-[#3e4451]">
                        {tierLabel}
                      </span>
                    </td>
                    <td className="px-1.5 py-1 text-right">
                      <button
                        type="button"
                        id={`remove-target-${idx}`}
                        onClick={() => onRemoveTarget(idx)}
                        className="px-1.5 py-0.5 bg-[#3b2025] hover:bg-[#4d2930] text-[#e06c75] border border-[#6b353f] text-[10px]"
                      >
                        Del
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* In-Game Regex Bar and Clear Action */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
        <div className="flex items-center gap-1 flex-1 min-w-[200px]">
          <span className="text-[11px] text-[#5c6370] shrink-0 font-mono">In-game regex:</span>
          <input
            type="text"
            readOnly
            value={combinedSearchRegex || 'None selected'}
            className="flex-1 bg-[#14161b] border border-[#3a3f4b] px-1.5 py-0.5 font-mono text-[10px] text-[#98c379] truncate select-all"
          />
          <button
            type="button"
            id="copy-ingame-regex-btn"
            onClick={handleCopyRegex}
            disabled={!combinedSearchRegex}
            className="px-2 py-0.5 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#abb2bf] hover:text-white flex items-center gap-1 disabled:opacity-40"
          >
            {copiedRegex ? <Check className="w-3 h-3 text-[#98c379]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedRegex ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {selected.length > 0 && (
          <button
            type="button"
            id="clear-targets-btn"
            onClick={onClearTargets}
            className="px-2 py-0.5 bg-[#2c313a] hover:bg-[#353b45] text-[#e06c75] border border-[#3e4451] text-[11px]"
          >
            Clear All
          </button>
        )}
      </div>
    </fieldset>
  );
};
