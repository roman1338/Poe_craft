import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Table,
  Plus,
  Sparkles,
  Search,
  ArrowUpDown,
  Filter,
  Check,
  ChevronDown,
} from 'lucide-react';
import { ModsDatabase } from '../../utils/modsDb';
import { SelectedTarget, AppSettings, ModDef } from '../../types';

interface CraftTabProps {
  db: ModsDatabase;
  itemClass: string;
  setItemClass: (cls: string) => void;
  selectedTargets: SelectedTarget[];
  onAddTarget: (modId: string, minTier: number | null) => void;
  onUpdateTargetTier?: (index: number, minTier: number | null) => void;
  onRemoveTarget: (index: number) => void;
  onClearTargets: () => void;
  onOpenModsTable: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onOpenPinModal: (slotName: string) => void;
}

export const CraftTab: React.FC<CraftTabProps> = ({
  db,
  itemClass,
  setItemClass,
  selectedTargets,
  onAddTarget,
  onUpdateTargetTier,
  onRemoveTarget,
  onClearTargets,
  onOpenModsTable,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'Prefix' | 'Suffix'>('Prefix');
  const [selectedQuickMod, setSelectedQuickMod] = useState<ModDef | null>(null);

  // Available classes for dropdown
  const classList = useMemo(() => db.classIds(), [db]);

  // Mods available for current class
  const classMods = useMemo(() => db.modsForClass(itemClass), [db, itemClass]);

  // Filtered & automatically sorted list
  const processedMods = useMemo(() => {
    let list = classMods.filter((m) => m.kind === kindFilter);

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.group.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }

    // Automatic consistent alphabetical sort
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [classMods, kindFilter, searchQuery]);

  // Total counts
  const prefixCount = useMemo(() => classMods.filter((m) => m.kind === 'Prefix').length, [classMods]);
  const suffixCount = useMemo(() => classMods.filter((m) => m.kind === 'Suffix').length, [classMods]);

  // Get available tiers for a given mod
  const getModTiers = (mod: ModDef) => {
    return mod.tiers_by_class[itemClass] || mod.tiers_by_class['_default'] || [];
  };

  return (
    <div className="flex-1 flex flex-col p-2.5 text-xs text-[#cbd5e1] gap-2.5 select-none overflow-y-auto bg-[#171b26]">
      {/* 1. Item Class & Quick Filter Bar */}
      <div className="bg-[#191f2c] border border-[#273043] p-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            Item Class & Modifiers Selection
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#94a3b8]">Class:</span>
            <select
              value={itemClass}
              onChange={(e) => {
                setItemClass(e.target.value);
                setSelectedQuickMod(null);
              }}
              className="bg-[#0e1219] border border-[#273043] px-2 py-1 text-xs text-[#38bdf8] font-mono cursor-pointer font-bold"
            >
              {classList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Prefix / Suffix Filter Tabs */}
        <div className="flex items-center gap-2 pt-1">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search mod name or stat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e1219] border border-[#273043] pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-[#64748b]"
            />
          </div>

          {/* Prefix / Suffix Toggle Tabs */}
          <div className="flex items-center bg-[#0e1219] border border-[#273043] p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setKindFilter('Prefix');
                setSelectedQuickMod(null);
              }}
              className={`px-3 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                kindFilter === 'Prefix'
                  ? 'bg-[#0369a1] text-white shadow-sm'
                  : 'text-[#38bdf8] hover:text-white'
              }`}
            >
              Prefix ({prefixCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setKindFilter('Suffix');
                setSelectedQuickMod(null);
              }}
              className={`px-3 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                kindFilter === 'Suffix'
                  ? 'bg-[#b45309] text-white shadow-sm'
                  : 'text-[#f59e0b] hover:text-white'
              }`}
            >
              Suffix ({suffixCount})
            </button>
          </div>
        </div>

        {/* Mod Catalogue List & Tier Selector Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-1">
          {/* Mods list */}
          <div className={`${selectedQuickMod ? 'md:col-span-7' : 'md:col-span-12'} h-44 bg-[#0e1219] border border-[#273043] p-1 overflow-y-auto font-mono text-xs transition-all`}>
            {processedMods.length === 0 ? (
              <div className="text-[#64748b] text-center py-10">No modifiers match your filter.</div>
            ) : (
              <div className="space-y-1">
                {processedMods.map((m) => {
                  const isSelected = selectedTargets.some((t) => t.id === m.id);
                  const isInspecting = selectedQuickMod?.id === m.id;
                  const tiers = getModTiers(m);
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedQuickMod(m);
                        if (!isSelected && selectedTargets.length < 2) {
                          onAddTarget(m.id, 1);
                        }
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 cursor-pointer transition-colors border ${
                        isInspecting
                          ? 'bg-[#1e2f47] border-[#3891d4] text-white font-semibold'
                          : isSelected
                          ? 'bg-[#152538] border-[#224466] text-white'
                          : 'bg-[#121620] border-transparent hover:bg-[#161f2e] text-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                            m.kind === 'Prefix'
                              ? 'bg-[#0369a1]/30 text-[#38bdf8] border border-[#0369a1]'
                              : 'bg-[#b45309]/30 text-[#f59e0b] border border-[#b45309]'
                          }`}
                        >
                          {m.kind === 'Prefix' ? 'P' : 'S'}
                        </span>
                        <span className="truncate font-sans font-medium text-xs">{m.name}</span>
                        {tiers.length > 0 && (
                          <span className="text-[10px] text-[#64748b] shrink-0 font-mono">
                            ({tiers.length} Tiers)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <span className="text-[11px] text-[#98c379] font-bold font-sans flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#98c379]" /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#64748b] font-sans hover:text-[#38bdf8]">
                            Select
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tier Selection Panel (Shown when a mod is clicked) */}
          {selectedQuickMod && (
            <div className="md:col-span-5 h-44 bg-[#121620] border border-[#273043] p-2 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#212838]">
                <div className="min-w-0 pr-1">
                  <div className="font-bold text-white text-xs truncate">{selectedQuickMod.name}</div>
                  <div className="text-[10px] text-[#94a3b8] flex items-center gap-1.5">
                    <span className={selectedQuickMod.kind === 'Prefix' ? 'text-[#38bdf8] font-bold' : 'text-[#f59e0b] font-bold'}>
                      {selectedQuickMod.kind}
                    </span>
                    <span>•</span>
                    <span className="truncate">{selectedQuickMod.group}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedQuickMod(null)}
                  className="text-[#64748b] hover:text-white text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tiers List */}
              <div className="flex-1 space-y-1 overflow-y-auto font-mono text-[11px]">
                {getModTiers(selectedQuickMod).length === 0 ? (
                  <div className="text-[#64748b] text-center py-4 text-xs">No tiered values defined for this class.</div>
                ) : (
                  getModTiers(selectedQuickMod).map((t) => (
                    <div
                      key={t.tier}
                      onClick={() => {
                        const existingIdx = selectedTargets.findIndex((st) => st.id === selectedQuickMod.id);
                        if (existingIdx >= 0 && onUpdateTargetTier) {
                          onUpdateTargetTier(existingIdx, t.tier);
                        } else if (existingIdx < 0) {
                          onAddTarget(selectedQuickMod.id, t.tier);
                        }
                      }}
                      className="flex items-center justify-between p-1.5 bg-[#0e1219] border border-[#212838] hover:border-[#3891d4] hover:bg-[#162030] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#fbbf24] text-xs">T{t.tier}</span>
                        <span className="text-[#64748b] text-[10px]">iLvl {t.ilvl}</span>
                        <span className="text-[#cbd5e1] text-[10px]">
                          ({t.mins[0]}-{t.maxs[0]})
                        </span>
                      </div>
                      <span className="text-[#38bdf8] text-[10px] font-bold">
                        Pick T{t.tier}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Add any tier button */}
              <div className="pt-1.5 mt-1 border-t border-[#212838]">
                <button
                  type="button"
                  onClick={() => {
                    const existingIdx = selectedTargets.findIndex((st) => st.id === selectedQuickMod.id);
                    if (existingIdx >= 0 && onUpdateTargetTier) {
                      onUpdateTargetTier(existingIdx, null);
                    } else if (existingIdx < 0) {
                      onAddTarget(selectedQuickMod.id, null);
                    }
                  }}
                  className="w-full py-1 bg-[#242c3d] hover:bg-[#2d374d] text-white text-[11px] font-bold border border-[#37435d] cursor-pointer text-center"
                >
                  Any Tier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Active Target Modifiers Table (With Simplified Tier Selection) */}
      <div className="bg-[#121620] border border-[#273043] flex-1 min-h-[160px] flex flex-col">
        {/* Table Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#191f2c] border-b border-[#273043] text-xs font-bold text-[#94a3b8]">
          <span className="flex-1">Active Target Modifiers ({selectedTargets.length}/2)</span>
          {selectedTargets.length > 0 && (
            <button
              type="button"
              onClick={onClearTargets}
              className="text-[10px] text-[#f87171] hover:underline mr-4 cursor-pointer"
            >
              Clear all
            </button>
          )}
          <span className="w-24 text-center">Tier</span>
          <span className="w-16 text-right">Type</span>
        </div>

        {/* Table Body */}
        <div className="flex-1 p-1 overflow-y-auto divide-y divide-[#1e2536] font-mono text-xs">
          {selectedTargets.length === 0 ? (
            <div className="text-center py-8 text-[#64748b]">
              No target affixes selected. Select mods above or click "Open mods table".
            </div>
          ) : (
            selectedTargets.map((t, idx) => {
              const mod = db.findMod(t.id);
              const name = mod ? mod.name : t.id;
              const isPrefix = mod ? mod.kind === 'Prefix' : t.id.startsWith('prefix');
              const tiers = mod ? getModTiers(mod) : [];

              return (
                <div
                  key={`${t.id}-${idx}`}
                  className="flex items-center justify-between px-3 py-2 hover:bg-[#161c28] group transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span className="truncate text-white font-sans text-xs font-medium">{name}</span>
                    <span className="text-[10px] text-[#64748b]">
                      {mod ? mod.group : ''}
                    </span>
                  </div>

                  {/* Clean Simple Tier Selector Dropdown (T1 ... T_max or Any) */}
                  <div className="flex items-center gap-1 w-24 justify-center shrink-0">
                    <select
                      value={t.min_tier !== null && t.min_tier !== undefined ? t.min_tier : 'any'}
                      onChange={(e) => {
                        const val = e.target.value === 'any' ? null : parseInt(e.target.value, 10);
                        if (onUpdateTargetTier) {
                          onUpdateTargetTier(idx, val);
                        }
                      }}
                      className="w-full bg-[#0e1219] border border-[#273043] px-2 py-1 text-xs text-[#fbbf24] font-mono font-bold cursor-pointer hover:border-[#3891d4] text-center"
                    >
                      <option value="any">Any</option>
                      {tiers.map((tr) => (
                        <option key={tr.tier} value={tr.tier}>
                          T{tr.tier}
                        </option>
                      ))}
                      {tiers.length === 0 && (
                        <>
                          <option value="1">T1</option>
                          <option value="2">T2</option>
                          <option value="3">T3</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        isPrefix
                          ? 'bg-[#0369a1]/30 text-[#38bdf8] border border-[#0369a1]'
                          : 'bg-[#b45309]/30 text-[#f59e0b] border border-[#b45309]'
                      }`}
                    >
                      {isPrefix ? 'Prefix' : 'Suffix'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveTarget(idx)}
                      className="text-[#64748b] hover:text-[#f87171] p-1 cursor-pointer"
                      title="Remove mod"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Full-Width "Open mods table" Button */}
      <button
        type="button"
        id="btn-open-mods-table"
        onClick={onOpenModsTable}
        className="w-full py-2.5 bg-[#20446e] hover:bg-[#29548a] border border-[#3b73b3] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
      >
        <Table className="w-4 h-4 text-[#38bdf8]" />
        <span>Open full mods table (PoEDB Database)</span>
      </button>
    </div>
  );
};
