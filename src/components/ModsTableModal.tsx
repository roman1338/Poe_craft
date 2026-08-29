import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Filter, Sparkles, Check } from 'lucide-react';
import { ModsDatabase } from '../utils/modsDb';
import { ModDef } from '../types';

interface ModsTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: ModsDatabase;
  itemClass: string;
  selectedIds: string[];
  onAddTarget: (modId: string, minTier: number | null) => void;
}

export const ModsTableModal: React.FC<ModsTableModalProps> = ({
  isOpen,
  onClose,
  db,
  itemClass,
  selectedIds,
  onAddTarget,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Prefix' | 'Suffix'>('All');
  const [filterInfluence, setFilterInfluence] = useState('All');
  const [selectedMod, setSelectedMod] = useState<ModDef | null>(null);

  if (!isOpen) return null;

  const allClassMods = db.modsForClass(itemClass);

  const filteredMods = allClassMods.filter((m) => {
    if (filterType !== 'All' && m.kind !== filterType) return false;
    if (filterInfluence !== 'All' && m.influence !== filterInfluence) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchGroup = m.group.toLowerCase().includes(q);
      const matchId = m.id.toLowerCase().includes(q);
      return matchName || matchGroup || matchId;
    }
    return true;
  });

  const tiers = selectedMod
    ? selectedMod.tiers_by_class[itemClass] || selectedMod.tiers_by_class['_default'] || []
    : [];

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 select-none">
      <div className="bg-[#171b26] border-2 border-[#273043] max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl text-xs text-[#cbd5e1]">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#191f2c] border-b border-[#273043]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">PoEDB Modifier Database</span>
            <span className="text-[#38bdf8] font-mono text-xs">[{itemClass}]</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 bg-[#242c3d] hover:bg-[#b91c1c] hover:text-white text-[#94a3b8] border border-[#37435d] font-bold"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-2.5 bg-[#161a25] border-b border-[#273043] flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search by mod name, group, or stat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0e1219] border border-[#273043] pl-7 pr-2 py-1 text-xs text-white placeholder-[#64748b]"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterType('All')}
              className={`px-2.5 py-1 text-xs border ${
                filterType === 'All'
                  ? 'bg-[#1872b8] border-[#3891d4] text-white font-bold'
                  : 'bg-[#1e2536] border-[#313e59] text-[#94a3b8] hover:text-white'
              }`}
            >
              All ({allClassMods.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('Prefix')}
              className={`px-2.5 py-1 text-xs border ${
                filterType === 'Prefix'
                  ? 'bg-[#1872b8] border-[#3891d4] text-white font-bold'
                  : 'bg-[#1e2536] border-[#313e59] text-[#94a3b8] hover:text-white'
              }`}
            >
              Prefixes
            </button>
            <button
              type="button"
              onClick={() => setFilterType('Suffix')}
              className={`px-2.5 py-1 text-xs border ${
                filterType === 'Suffix'
                  ? 'bg-[#1872b8] border-[#3891d4] text-white font-bold'
                  : 'bg-[#1e2536] border-[#313e59] text-[#94a3b8] hover:text-white'
              }`}
            >
              Suffixes
            </button>
          </div>

          <select
            value={filterInfluence}
            onChange={(e) => setFilterInfluence(e.target.value)}
            className="bg-[#0e1219] border border-[#273043] px-2 py-1 text-xs text-white"
          >
            <option value="All">All Influences</option>
            <option value="Normal">Normal Mods</option>
            <option value="Hunter">Hunter</option>
            <option value="Crusader">Crusader</option>
            <option value="Redeemer">Redeemer</option>
            <option value="Warlord">Warlord</option>
            <option value="Shaper">Shaper</option>
            <option value="Elder">Elder</option>
          </select>
        </div>

        {/* Master-Detail Split Table */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Master List */}
          <div className="flex-1 border-r border-[#273043] overflow-y-auto bg-[#121620]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#191f2c] text-[#94a3b8] sticky top-0 border-b border-[#273043] text-[11px]">
                <tr>
                  <th className="py-1.5 px-3 w-12">Type</th>
                  <th className="py-1.5 px-3">Modifier Name</th>
                  <th className="py-1.5 px-3 w-28">Group</th>
                  <th className="py-1.5 px-3 w-24">Influence</th>
                  <th className="py-1.5 px-3 w-20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2230] font-mono text-[11px]">
                {filteredMods.map((m) => {
                  const isSelected = selectedIds.includes(m.id);
                  const isRowActive = selectedMod?.id === m.id;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMod(m)}
                      className={`cursor-pointer transition-colors ${
                        isRowActive
                          ? 'bg-[#1e2f47] text-white'
                          : isSelected
                          ? 'bg-[#152538] text-[#e2e8f0]'
                          : 'hover:bg-[#161c28] text-[#cbd5e1]'
                      }`}
                    >
                      <td className="py-1.5 px-3 font-bold">
                        <span
                          className={m.kind === 'Prefix' ? 'text-[#38bdf8]' : 'text-[#e5c07b]'}
                        >
                          {m.kind === 'Prefix' ? 'P' : 'S'}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 font-sans text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{m.name}</span>
                          {isSelected && (
                            <span className="text-[10px] text-[#98c379] font-bold">[ACTIVE TARGET]</span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-3 text-[#64748b] truncate">{m.group}</td>
                      <td className="py-1.5 px-3">
                        <span
                          className={`text-[10px] px-1 py-0.2 border ${
                            m.influence === 'Normal'
                              ? 'border-[#273043] text-[#94a3b8]'
                              : 'border-[#4c3f68] text-[#c084fc] bg-[#221833]'
                          }`}
                        >
                          {m.influence}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddTarget(m.id, 1);
                          }}
                          className={`px-2 py-0.5 text-[10px] border font-bold ${
                            isSelected
                              ? 'bg-[#1e293b] border-[#334155] text-[#94a3b8]'
                              : 'bg-[#1872b8] hover:bg-[#1f7ec8] border-[#3891d4] text-white'
                          }`}
                        >
                          {isSelected ? 'Added' : '+ Add'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Detail Pane (Tier Inspector) */}
          <div className="w-80 bg-[#161a25] p-3 flex flex-col overflow-y-auto">
            {selectedMod ? (
              <div className="space-y-3">
                <div className="pb-2 border-b border-[#273043]">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        selectedMod.kind === 'Prefix' ? 'text-[#38bdf8]' : 'text-[#e5c07b]'
                      }`}
                    >
                      {selectedMod.kind} Modifier
                    </span>
                    <span className="text-[10px] text-[#64748b] font-mono">{selectedMod.id}</span>
                  </div>
                  <div className="text-white font-bold text-sm mt-1">{selectedMod.name}</div>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5">
                    Mod Group: <span className="text-white">{selectedMod.group}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#e2e8f0] mb-1.5">
                    Available Tiers ({tiers.length})
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {tiers.length === 0 ? (
                      <div className="text-[#64748b]">No tiered roll ranges for this class.</div>
                    ) : (
                      tiers.map((t) => (
                        <div
                          key={t.tier}
                          className="flex items-center justify-between p-1.5 bg-[#0e1219] border border-[#273043]"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#e5c07b]">T{t.tier}</span>
                            <span className="text-[#64748b] text-[10px]">iLvl {t.ilvl}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white">
                              {t.mins[0]}-{t.maxs[0]}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddTarget(selectedMod.id, t.tier)}
                            className="px-2 py-0.5 bg-[#1872b8] hover:bg-[#1f7ec8] border border-[#3891d4] text-[10px] text-white font-bold"
                          >
                            Set &lt;= T{t.tier}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#273043]">
                  <button
                    type="button"
                    onClick={() => onAddTarget(selectedMod.id, null)}
                    className="w-full py-1.5 bg-[#242c3d] hover:bg-[#2d374d] border border-[#37435d] text-white font-bold text-xs"
                  >
                    Add Mod (Any Tier)
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-[#64748b]">
                Select any modifier on the left to view tier breakdowns, ilvls, and roll ranges.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#191f2c] border-t border-[#273043]">
          <span className="text-[11px] text-[#64748b]">
            Showing {filteredMods.length} of {allClassMods.length} available modifiers for {itemClass}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-[#1872b8] hover:bg-[#1f7ec8] border border-[#3891d4] text-white font-semibold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
