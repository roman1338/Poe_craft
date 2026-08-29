import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, ChevronRight, Filter } from 'lucide-react';
import { ModDef, TierRange } from '../types';
import { ModsDatabase } from '../utils/modsDb';

interface ModPickerProps {
  db: ModsDatabase;
  itemClass: string;
  setItemClass: (cls: string) => void;
  selectedIds: string[];
  onAddTarget: (modId: string, minTier: number | null) => void;
}

export const ModPicker: React.FC<ModPickerProps> = ({
  db,
  itemClass,
  setItemClass,
  selectedIds,
  onAddTarget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'Any' | 'Prefix' | 'Suffix'>('Any');
  const [influenceFilter, setInfluenceFilter] = useState('Any');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedModId, setSelectedModId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  const classIds = useMemo(() => db.classIds(), [db]);
  const influences = useMemo(() => db.influences(), [db]);

  const filteredMods = useMemo(() => {
    return db.filterMods(itemClass, searchQuery, kindFilter, influenceFilter, categoryFilter);
  }, [db, itemClass, searchQuery, kindFilter, influenceFilter, categoryFilter]);

  const selectedMod = useMemo(() => {
    if (!selectedModId) {
      return filteredMods.length > 0 ? filteredMods[0] : null;
    }
    const found = db.get(selectedModId);
    if (found && filteredMods.some((m) => m.id === found.id)) {
      return found;
    }
    return filteredMods.length > 0 ? filteredMods[0] : null;
  }, [db, selectedModId, filteredMods]);

  const availableTiers = useMemo(() => {
    if (!selectedMod) return [];
    return (
      selectedMod.tiers_by_class[itemClass] ||
      selectedMod.tiers_by_class['_default'] ||
      []
    );
  }, [selectedMod, itemClass]);

  const isAlreadyAdded = selectedMod ? selectedIds.includes(selectedMod.id) : false;

  const handleAdd = (tierOverride?: number | null) => {
    if (!selectedMod) return;
    const tierToUse = tierOverride !== undefined ? tierOverride : selectedTier;
    onAddTarget(selectedMod.id, tierToUse);
  };

  const formatTierRange = (t: TierRange) => {
    if (!t.mins.length && !t.maxs.length) return '';
    return t.mins
      .map((min, idx) => {
        const max = t.maxs[idx] ?? min;
        return min === max ? `${min}` : `${min}–${max}`;
      })
      .join(', ');
  };

  return (
    <fieldset className="border border-[#3a3f4b] bg-[#21252b] p-2.5 flex flex-col text-xs text-[#abb2bf]">
      <legend className="px-1.5 font-bold text-[#d7dae0] flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-[#61afef]" />
        <span>1. Mod Database Browser</span>
        <span className="text-[10px] text-[#5c6370] font-normal font-mono">
          ({filteredMods.length} available)
        </span>
      </legend>

      {/* Quick Search & Filters Bar */}
      <div className="space-y-1.5 mb-2">
        {/* Search Input */}
        <div className="flex items-center gap-1">
          <input
            id="mod-search-input"
            type="text"
            placeholder="Search mods: Life, Fire Res, Physical Damage, +1 Spell..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-[#14161b] border border-[#3a3f4b] px-2 py-1 text-xs text-[#d7dae0] placeholder-[#5c6370] focus:outline-none focus:border-[#e5c07b]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="bg-[#282c34] border border-[#3a3f4b] px-2 py-1 text-xs text-[#5c6370] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-12 gap-1 text-[11px]">
          {/* Prefix / Suffix / Any */}
          <div className="col-span-4 flex border border-[#3a3f4b] bg-[#14161b]">
            {(['Any', 'Prefix', 'Suffix'] as const).map((k) => (
              <button
                key={k}
                id={`filter-kind-${k.toLowerCase()}`}
                type="button"
                onClick={() => setKindFilter(k)}
                className={`flex-1 py-0.5 text-center font-medium ${
                  kindFilter === k
                    ? 'bg-[#2c313a] text-white'
                    : 'text-[#5c6370] hover:text-[#abb2bf]'
                }`}
              >
                {k === 'Prefix' ? 'Pfx' : k === 'Suffix' ? 'Sfx' : 'All'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            id="filter-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="col-span-4 bg-[#14161b] border border-[#3a3f4b] text-[#abb2bf] px-1 py-0.5 focus:outline-none focus:border-[#e5c07b]"
          >
            <option value="All">All Categories</option>
            <option value="Life & ES">Life & ES</option>
            <option value="Resistances">Resistances</option>
            <option value="Attributes">Attributes</option>
            <option value="Damage & Attack">Damage & Attack</option>
            <option value="Spells & Cast">Spells & Cast</option>
            <option value="Defences">Defences & Spell Suppress</option>
            <option value="Gem Levels">Gem Levels (+1)</option>
            <option value="DoT Multi">Damage over Time Multi</option>
          </select>

          {/* Influence Dropdown */}
          <select
            id="influence-filter-select"
            value={influenceFilter}
            onChange={(e) => setInfluenceFilter(e.target.value)}
            className="col-span-4 bg-[#14161b] border border-[#3a3f4b] text-[#abb2bf] px-1 py-0.5 focus:outline-none focus:border-[#e5c07b]"
          >
            <option value="Any">All Influences</option>
            <option value="Normal">Normal (No Inf)</option>
            {influences.map((inf) => (
              <option key={inf} value={inf}>
                {inf}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Master-Detail View: Mod List & Tier Inspector */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5">
        {/* Left: Scrollable Listbox of Modifiers */}
        <div className="sm:col-span-6 border border-[#3a3f4b] bg-[#14161b] h-52 overflow-y-auto font-mono text-[11px]">
          {filteredMods.length === 0 ? (
            <div className="p-3 text-center text-[#5c6370]">No modifiers matching filters.</div>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {filteredMods.map((m) => {
                  const isSelected = selectedMod?.id === m.id;
                  const isTarget = selectedIds.includes(m.id);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => {
                        setSelectedModId(m.id);
                        setSelectedTier(null);
                      }}
                      className={`cursor-pointer border-b border-[#21252b] ${
                        isSelected
                          ? 'bg-[#2c313a] text-white'
                          : 'hover:bg-[#1a1d24] text-[#abb2bf]'
                      }`}
                    >
                      <td className="w-7 px-1 py-0.5 text-center font-bold">
                        <span
                          className={`px-1 rounded-none text-[9px] ${
                            m.kind === 'Prefix'
                              ? 'bg-[#61afef]/20 text-[#61afef]'
                              : 'bg-[#c678dd]/20 text-[#c678dd]'
                          }`}
                        >
                          {m.kind === 'Prefix' ? 'P' : 'S'}
                        </span>
                      </td>
                      <td className="px-1.5 py-0.5 truncate font-sans text-xs">
                        <div className="flex items-center gap-1">
                          <span className="truncate">{m.name}</span>
                          {isTarget && (
                            <span className="text-[10px] text-[#98c379] font-bold shrink-0">
                              [SET]
                            </span>
                          )}
                        </div>
                        {m.influence && (
                          <span className="text-[9px] text-[#e5c07b] font-mono block">
                            [{m.influence}]
                          </span>
                        )}
                      </td>
                      <td className="w-8 px-1 py-0.5 text-right text-[10px] text-[#5c6370] shrink-0">
                        {m.tiers_by_class[itemClass]?.length || 0}T
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: Selected Modifier Details & Tier Configuration */}
        <div className="sm:col-span-6 border border-[#3a3f4b] bg-[#181a1f] p-2 flex flex-col justify-between h-52">
          {selectedMod ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Header of selected mod */}
                <div className="flex items-start justify-between gap-1 pb-1 border-b border-[#2d3139]">
                  <div>
                    <div className="font-bold text-[#d7dae0] text-xs">
                      {selectedMod.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#5c6370]">
                      {selectedMod.kind} · {selectedMod.group}
                      {selectedMod.influence ? ` · ${selectedMod.influence}` : ''}
                    </div>
                  </div>
                  <span
                    className={`px-1 text-[10px] font-mono ${
                      selectedMod.kind === 'Prefix'
                        ? 'text-[#61afef] bg-[#61afef]/10'
                        : 'text-[#c678dd] bg-[#c678dd]/10'
                    }`}
                  >
                    {selectedMod.kind}
                  </span>
                </div>

                {/* Tier Selection Table */}
                <div className="mt-1.5 max-h-24 overflow-y-auto border border-[#2d3139] bg-[#14161b]">
                  {availableTiers.length === 0 ? (
                    <div className="p-1.5 text-[10px] text-[#5c6370]">
                      Standard single-tier modifier.
                    </div>
                  ) : (
                    <table className="w-full text-[10px] font-mono">
                      <thead className="bg-[#21252b] text-[#5c6370] text-left">
                        <tr>
                          <th className="px-1 py-0.5">Tier</th>
                          <th className="px-1 py-0.5">iLvl</th>
                          <th className="px-1 py-0.5">Roll Values</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableTiers.map((t) => {
                          const isPicked = selectedTier === t.tier;
                          return (
                            <tr
                              key={t.tier}
                              onClick={() => setSelectedTier(t.tier)}
                              className={`cursor-pointer border-t border-[#21252b] ${
                                isPicked
                                  ? 'bg-[#2c313a] text-white font-bold'
                                  : 'hover:bg-[#1a1d24] text-[#abb2bf]'
                              }`}
                            >
                              <td className="px-1 py-0.5 text-[#e5c07b]">T{t.tier}</td>
                              <td className="px-1 py-0.5 text-[#5c6370]">{t.ilvl}</td>
                              <td className="px-1 py-0.5 text-[#98c379] truncate">
                                {formatTierRange(t)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1.5 flex flex-wrap items-center gap-1 border-t border-[#2d3139]">
                <button
                  type="button"
                  id="add-mod-any-tier-btn"
                  onClick={() => handleAdd(null)}
                  className="flex-1 px-2 py-1 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#abb2bf] hover:text-white font-semibold text-[11px]"
                >
                  + Add Any Tier
                </button>

                {availableTiers.length > 0 && (
                  <button
                    type="button"
                    id="add-mod-t1-only-btn"
                    onClick={() => handleAdd(1)}
                    className="flex-1 px-2 py-1 bg-[#233827] hover:bg-[#2e4a34] border border-[#3e6847] text-[#98c379] font-bold text-[11px]"
                  >
                    + Add T1 Only
                  </button>
                )}

                {selectedTier && selectedTier > 1 && (
                  <button
                    type="button"
                    id="add-mod-custom-tier-btn"
                    onClick={() => handleAdd(selectedTier)}
                    className="px-2 py-1 bg-[#2c313a] hover:bg-[#353b45] border border-[#3e4451] text-[#e5c07b] text-[11px]"
                  >
                    + Add T1–T{selectedTier}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#5c6370]">
              Select a modifier on the left
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
};
