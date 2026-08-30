import React, { useState, useEffect, useMemo, useRef } from 'react';
import { globalModsDb, compileTarget } from './utils/modsDb';
import { AppSettings, SelectedTarget, CompiledTarget, CrafterTab } from './types';
import { CrafterWindowHeader } from './components/CrafterWindowHeader';
import { CrafterSidebar } from './components/CrafterSidebar';
import { CraftTab } from './components/tabs/CraftTab';
import { GeneralTab } from './components/tabs/GeneralTab';
import { MapCraftTab } from './components/tabs/MapCraftTab';
import { CrafterBottomBar } from './components/CrafterBottomBar';
import { CrafterConsoleLog, LogEntry } from './components/CrafterConsoleLog';
import { ModsTableModal } from './components/ModsTableModal';
import { OverlayHelperModal } from './components/OverlayHelperModal';

const DEFAULT_SETTINGS: AppSettings = {
  item_class: 'Medium Cluster Jewel',
  selected: [
    {
      id: 'prefix_martial_prowess',
      min_tier: 1,
    },
    {
      id: 'suffix_feed_the_fury',
      min_tier: 1,
    },
  ],
  delay_after_move: 0.05,
  delay_after_ctrl_c: 0.12,
  delay_after_click: 0.18,
  delay_between: 0.05,
  alt_key_swap: true,
  humanize: true,
  always_on_top: true,
  sound_alert: true,
  pause_on_unfocus: true,
  auto_aug: true,
  log_all_rolls: true,
  currency_limit_enabled: false,
  currency_limit: 9999,
  item_pos: [327, 446],
  alt_pos: [110, 269],
  aug_pos: [220, 327],
  regal_pos: [330, 269],
};

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('poe_crafter_settings_v3');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<CrafterTab>('craft');
  const [itemClass, setItemClass] = useState<string>(settings.item_class || 'Medium Cluster Jewel');
  const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[]>(settings.selected || []);

  const [isRunning, setIsRunning] = useState(false);
  const [showLog, setShowLog] = useState(true);
  const [modsTableOpen, setModsTableOpen] = useState(false);
  const [pinModalSlot, setPinModalSlot] = useState<string | null>(null);

  const [altsUsed, setAltsUsed] = useState(0);
  const [augsUsed, setAugsUsed] = useState(0);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      text: 'PoE Crafter initialized. Ready for crafting.',
      type: 'info',
    },
  ]);

  const runningRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    const updated: AppSettings = {
      ...settings,
      item_class: itemClass,
      selected: selectedTargets,
    };
    try {
      localStorage.setItem('poe_crafter_settings_v3', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }, [settings, itemClass, selectedTargets]);

  const addLog = (text: string, type: 'info' | 'alt' | 'aug' | 'success' | 'warn' = 'info') => {
    setLogs((prev) => [
      ...prev.slice(-200),
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        text,
        type,
      },
    ]);
  };

  const compiledTargets: CompiledTarget[] = useMemo(() => {
    return selectedTargets
      .map((t) => {
        try {
          return compileTarget(globalModsDb, t.id, itemClass, t.min_tier);
        } catch {
          return null;
        }
      })
      .filter((t): t is CompiledTarget => t !== null);
  }, [selectedTargets, itemClass]);

  const handleClassChange = (newClass: string) => {
    setItemClass(newClass);
    const available = new Set(globalModsDb.modsForClass(newClass).map((m) => m.id));
    setSelectedTargets((prev) => prev.filter((t) => available.has(t.id)));
  };

  const handleAddTarget = (modId: string, minTier: number | null) => {
    if (selectedTargets.some((t) => t.id === modId)) {
      return;
    }
    if (selectedTargets.length >= 2) {
      alert('Magic items in Path of Exile can have at most 2 modifiers (1 Prefix, 1 Suffix). Remove one first.');
      return;
    }
    setSelectedTargets((prev) => [...prev, { id: modId, min_tier: minTier }]);
    const mod = globalModsDb.findMod(modId);
    addLog(`Target added: ${mod ? mod.name : modId} (${mod?.kind || 'Mod'}) [Tier: ${minTier ? `T${minTier}` : 'Any'}]`, 'info');
  };

  const handleUpdateTargetTier = (index: number, minTier: number | null) => {
    setSelectedTargets((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, min_tier: minTier } : t))
    );
    const target = selectedTargets[index];
    if (target) {
      addLog(`Target tier updated: ${target.id} -> ${minTier ? `T${minTier}` : 'Any Tier'}`, 'info');
    }
  };

  const handleRemoveTarget = (index: number) => {
    const removed = selectedTargets[index];
    setSelectedTargets((prev) => prev.filter((_, i) => i !== index));
    if (removed) {
      addLog(`Target removed: ${removed.id}`, 'info');
    }
  };

  const handleClearTargets = () => {
    setSelectedTargets([]);
    addLog('All targets cleared.', 'info');
  };

  const handlePinSaved = (slotName: string, coords: [number, number]) => {
    if (slotName.toLowerCase().includes('item')) {
      setSettings((prev) => ({ ...prev, item_pos: coords }));
      addLog(`Item slot calibrated to (${coords[0]}, ${coords[1]})`, 'info');
    } else if (slotName.toLowerCase().includes('alt')) {
      setSettings((prev) => ({ ...prev, alt_pos: coords }));
      addLog(`Alteration slot calibrated to (${coords[0]}, ${coords[1]})`, 'alt');
    } else if (slotName.toLowerCase().includes('aug')) {
      setSettings((prev) => ({ ...prev, aug_pos: coords }));
      addLog(`Augmentation slot calibrated to (${coords[0]}, ${coords[1]})`, 'aug');
    } else if (slotName.toLowerCase().includes('regal')) {
      setSettings((prev) => ({ ...prev, regal_pos: coords }));
      addLog(`Regal slot calibrated to (${coords[0]}, ${coords[1]})`, 'warn');
    }
  };

  const simulateRoll = () => {
    const classMods = globalModsDb.modsForClass(itemClass);
    const prefixes = classMods.filter((m) => m.kind === 'Prefix');
    const suffixes = classMods.filter((m) => m.kind === 'Suffix');

    const rollPfx = prefixes.length > 0 && Math.random() < 0.75;
    const rollSfx = suffixes.length > 0 && (Math.random() < 0.75 || !rollPfx);

    const rolledMods: { id: string; name: string; tier: number }[] = [];
    if (rollPfx) {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      const tiers = p.tiers_by_class[itemClass] || p.tiers_by_class['_default'] || [{ tier: 1 }];
      const t = tiers[Math.floor(Math.random() * tiers.length)].tier;
      rolledMods.push({ id: p.id, name: p.name, tier: t });
    }
    if (rollSfx) {
      const s = suffixes[Math.floor(Math.random() * suffixes.length)];
      const tiers = s.tiers_by_class[itemClass] || s.tiers_by_class['_default'] || [{ tier: 1 }];
      const t = tiers[Math.floor(Math.random() * tiers.length)].tier;
      rolledMods.push({ id: s.id, name: s.name, tier: t });
    }

    const hit =
      compiledTargets.length > 0 &&
      compiledTargets.every((t) => {
        return rolledMods.some((rm) => {
          const idMatches = rm.id === t.id;
          const tierOk = t.min_tier === null || rm.tier <= t.min_tier;
          return idMatches && tierOk;
        });
      });

    return {
      hit,
      rolledText: rolledMods.map((r) => `${r.name} (T${r.tier})`).join(' | ') || 'No affixes',
    };
  };

  const handleStartCraft = () => {
    if (runningRef.current) return;
    if (selectedTargets.length === 0) {
      addLog('Select at least 1 target modifier before starting craft.', 'warn');
      return;
    }

    runningRef.current = true;
    setIsRunning(true);
    addLog(`[START] Crafting loop started for ${itemClass}. Press F9 or [Stop] to halt.`, 'info');

    let rollCount = 0;

    timerRef.current = setInterval(() => {
      if (!runningRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      rollCount++;
      const isAug = Math.random() < 0.35 && rollCount > 1;

      if (isAug) {
        setAugsUsed((prev) => prev + 1);
      } else {
        setAltsUsed((prev) => prev + 1);
      }

      const sim = simulateRoll();

      if (sim.hit) {
        runningRef.current = false;
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        addLog(`[SUCCESS] TARGET MATCH FOUND in ${rollCount} rolls!`, 'success');
        addLog(`Rolled: ${sim.rolledText}`, 'success');
      } else if (settings.log_all_rolls && rollCount % 10 === 0) {
        addLog(`[Roll #${rollCount}] ${sim.rolledText}`, isAug ? 'aug' : 'alt');
      }

      // Check currency limit
      if (settings.currency_limit_enabled && rollCount >= settings.currency_limit) {
        runningRef.current = false;
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        addLog(`[STOP] Reached currency limit (${settings.currency_limit}).`, 'warn');
      }
    }, 160);
  };

  const handleStopCraft = () => {
    runningRef.current = false;
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    addLog('[STOP] Crafting loop stopped by user.', 'warn');
  };

  const handleCleanArea = () => {
    handleStopCraft();
    setAltsUsed(0);
    setAugsUsed(0);
    addLog('Counters reset.', 'info');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'F8') {
        e.preventDefault();
        handleStartCraft();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleStopCraft();
      } else if (e.key === 'F6') {
        e.preventDefault();
        setPinModalSlot('Item Slot');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setPinModalSlot('Alteration Slot');
      } else if (e.key === 'F10') {
        e.preventDefault();
        setPinModalSlot('Augmentation Slot');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTargets, settings]);

  const handleExportAhk = () => {
    const itemX = settings.item_pos ? settings.item_pos[0] : 327;
    const itemY = settings.item_pos ? settings.item_pos[1] : 446;
    const altX = settings.alt_pos ? settings.alt_pos[0] : 110;
    const altY = settings.alt_pos ? settings.alt_pos[1] : 269;
    const augX = settings.aug_pos ? settings.aug_pos[0] : 220;
    const augY = settings.aug_pos ? settings.aug_pos[1] : 327;

    const script = `; ==============================================================================
; PoE Crafter - AutoHotkey Companion Script
; Generated for: ${itemClass}
; Target Mods: ${selectedTargets.map((t) => t.id).join(', ')}
; ==============================================================================
#NoEnv
#SingleInstance Force
SetBatchLines, -1
SetMouseDelay, -1
CoordMode, Mouse, Screen

global ITEM_X := ${itemX}
global ITEM_Y := ${itemY}
global ALT_X  := ${altX}
global ALT_Y  := ${altY}
global AUG_X  := ${augX}
global AUG_Y  := ${augY}

global DELAY_MOVE   := ${Math.round(settings.delay_after_move * 1000)}
global DELAY_CTRL_C := ${Math.round(settings.delay_after_ctrl_c * 1000)}
global DELAY_CLICK  := ${Math.round(settings.delay_after_click * 1000)}
global DELAY_BETWEEN:= ${Math.round(settings.delay_between * 1000)}

global IsRunning := false

TrayTip, PoE Crafter, Loaded. Press F8 to Start, F9 to Stop., 4

F8::
  IsRunning := true
  TrayTip, PoE Crafter, Crafting loop started., 2
  SetTimer, CraftLoop, -1
return

F9::
  IsRunning := false
  TrayTip, PoE Crafter, Crafting stopped., 2
return

F6::
  MouseGetPos, xpos, ypos
  ITEM_X := xpos
  ITEM_Y := ypos
  TrayTip, PoE Crafter, Item Slot set to %xpos%x%ypos%, 2
return

F7::
  MouseGetPos, xpos, ypos
  ALT_X := xpos
  ALT_Y := ypos
  TrayTip, PoE Crafter, Alt Orb set to %xpos%x%ypos%, 2
return

F10::
  MouseGetPos, xpos, ypos
  AUG_X := xpos
  AUG_Y := ypos
  TrayTip, PoE Crafter, Aug Orb set to %xpos%x%ypos%, 2
return

CraftLoop:
  while (IsRunning) {
    if (!WinActive("ahk_class POEWindowClass") && !WinActive("Path of Exile")) {
      Sleep, 200
      continue
    }

    ; Right-click Alt Orb
    MouseMove, ALT_X, ALT_Y, 0
    Sleep, DELAY_MOVE
    Click, Right
    Sleep, DELAY_CLICK

    ; Left-click Item
    MouseMove, ITEM_X, ITEM_Y, 0
    Sleep, DELAY_MOVE
    Click
    Sleep, DELAY_CLICK + DELAY_BETWEEN
  }
return
`;
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poe_crafter.ahk';
    a.click();
    URL.revokeObjectURL(url);
    addLog('Exported poe_crafter.ahk script.', 'info');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poe_crafter_profile.json';
    a.click();
    URL.revokeObjectURL(url);
    addLog('Exported profile to JSON.', 'info');
  };

  const handleImportJson = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        setSettings((prev) => ({ ...prev, ...parsed }));
        if (parsed.item_class) setItemClass(parsed.item_class);
        if (parsed.selected) setSelectedTargets(parsed.selected);
        addLog('Imported configuration profile successfully.', 'info');
      } catch {
        alert('Failed to parse JSON configuration file.');
      }
    };
    reader.readAsText(file);
  };

  const selectedIds = useMemo(() => selectedTargets.map((t) => t.id), [selectedTargets]);

  return (
    <div className="min-h-screen bg-[#0e1219] text-[#cbd5e1] flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Main Crafter Window Container */}
      <div className="w-full max-w-4xl bg-[#171b26] border-2 border-[#273043] shadow-2xl flex flex-col overflow-hidden min-h-[640px] max-h-[92vh]">
        {/* 1. Header (Cursive Crafter Title, Window controls, Currency Used, Options) */}
        <CrafterWindowHeader
          currencyUsed={altsUsed + augsUsed}
          currencyLimitEnabled={settings.currency_limit_enabled}
          currencyLimit={settings.currency_limit}
          onToggleCurrencyLimit={(enabled) =>
            setSettings((p) => ({ ...p, currency_limit_enabled: enabled }))
          }
          onChangeCurrencyLimit={(limit) =>
            setSettings((p) => ({ ...p, currency_limit: limit }))
          }
          showLog={showLog}
          onToggleLog={setShowLog}
        />

        {/* 2. Middle Body (Sidebar + Tab Content) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <CrafterSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* Right Active Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#171b26]">
            {activeTab === 'craft' && (
              <CraftTab
                db={globalModsDb}
                itemClass={itemClass}
                setItemClass={handleClassChange}
                selectedTargets={selectedTargets}
                onAddTarget={handleAddTarget}
                onUpdateTargetTier={handleUpdateTargetTier}
                onRemoveTarget={handleRemoveTarget}
                onClearTargets={handleClearTargets}
                onOpenModsTable={() => setModsTableOpen(true)}
                settings={settings}
                onSaveSettings={setSettings}
                onOpenPinModal={(slot) => setPinModalSlot(slot)}
              />
            )}

            {activeTab === 'general' && (
              <GeneralTab
                settings={settings}
                onSaveSettings={setSettings}
                onExportAhk={handleExportAhk}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
              />
            )}

            {activeTab === 'map_craft' && <MapCraftTab />}
          </div>
        </div>

        {/* 3. Collapsible Console Activity Log */}
        {showLog && (
          <CrafterConsoleLog logs={logs} onClear={() => setLogs([])} />
        )}

        {/* 4. Bottom Action Bar (4 Big Buttons: Set Alt, Set Item, Start craft, Clean area) */}
        <CrafterBottomBar
          isRunning={isRunning}
          onStartCraft={handleStartCraft}
          onStopCraft={handleStopCraft}
          onSetAlt={() => setPinModalSlot('Alteration Slot')}
          onSetItem={() => setPinModalSlot('Item Slot')}
          onCleanArea={handleCleanArea}
        />
      </div>

      {/* Modals */}
      <ModsTableModal
        isOpen={modsTableOpen}
        onClose={() => setModsTableOpen(false)}
        db={globalModsDb}
        itemClass={itemClass}
        selectedIds={selectedIds}
        onAddTarget={handleAddTarget}
      />

      <OverlayHelperModal
        isOpen={Boolean(pinModalSlot)}
        targetSlotName={pinModalSlot || 'Item Slot'}
        onClose={() => setPinModalSlot(null)}
        onPinSaved={handlePinSaved}
      />
    </div>
  );
};

export default App;
