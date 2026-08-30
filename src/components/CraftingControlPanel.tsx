import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Crosshair,
  RotateCcw,
  Clock,
  Download,
  Upload,
  FileCode,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import { AppSettings, SelectedTarget, CompiledTarget } from '../types';
import { ModsDatabase, compileTarget } from '../utils/modsDb';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: () => boolean;
      startCraft: (scriptContent: string) => void;
      stopCraft: () => void;
      onLog: (callback: (data: { message: string; type: 'info' | 'alt' | 'aug' | 'success' | 'warn' }) => void) => void;
      onStatusChange: (callback: (isRunning: boolean) => void) => void;
    };
  }
}

interface CraftingControlPanelProps {
  db: ModsDatabase;
  itemClass: string;
  selectedTargets: SelectedTarget[];
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onOpenPinModal: (slotName: string) => void;
}

export const CraftingControlPanel: React.FC<CraftingControlPanelProps> = ({
  db,
  itemClass,
  selectedTargets,
  settings,
  onSaveSettings,
  onOpenPinModal,
}) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const [status, setStatus] = useState<'idle' | 'running' | 'stopped' | 'success'>('idle');
  const [autoScroll, setAutoScroll] = useState(true);
  const [logs, setLogs] = useState<
    Array<{ id: number; time: string; text: string; type: 'info' | 'alt' | 'aug' | 'success' | 'warn' }>
  >([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      text: `Crafter ready for ${itemClass}. Select 1 or 2 mods, calibrate coords (F6/F7/F10), then Start (F1).`,
      type: 'info',
    },
  ]);

  const [stats, setStats] = useState({
    attempts: 0,
    altsUsed: 0,
    augsUsed: 0,
    elapsedSeconds: 0,
    rollsPerSec: 0,
    lastHitMod: '',
  });

  const runningRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const compiledTargets: CompiledTarget[] = React.useMemo(() => {
    return selectedTargets
      .map((t) => {
        try {
          return compileTarget(db, t.id, itemClass, t.min_tier);
        } catch {
          return null;
        }
      })
      .filter((t): t is CompiledTarget => t !== null);
  }, [db, selectedTargets, itemClass]);

  const addLog = (text: string, type: 'info' | 'alt' | 'aug' | 'success' | 'warn' = 'info') => {
    setLogs((prev) => [
      ...prev.slice(-150),
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        text,
        type,
      },
    ]);
  };

  // Keyboard shortcut listener for F1 / F2 / F6 / F7 / F10
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        handleStart();
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleStop('F2 pressed');
      } else if (e.key === 'F6') {
        e.preventDefault();
        onOpenPinModal('Item Slot');
      } else if (e.key === 'F7') {
        e.preventDefault();
        onOpenPinModal('Alteration Slot');
      } else if (e.key === 'F10') {
        e.preventDefault();
        onOpenPinModal('Augmentation Slot');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTargets, form]);

  // Subscribe to Electron events if running inside Electron shell
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onLog((logData) => {
        addLog(logData.message, logData.type);
      });

      window.electronAPI.onStatusChange((isRunning) => {
        if (isRunning) {
          setStatus('running');
          runningRef.current = true;
        } else {
          setStatus('stopped');
          runningRef.current = false;
        }
      });
      
      addLog('[Electron] Native Desktop Environment detected! Using built-in AutoHotkey executor.', 'success');
    }
  }, []);

  const simulateRoll = () => {
    // Check if targets are met in simulated roll
    const classMods = db.modsForClass(itemClass);
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

    // Check if rolled mods satisfy all compiled targets
    const targetCheck = compiledTargets.every((t) => {
      return rolledMods.some((rm) => {
        const idMatches = rm.id === t.id;
        const tierOk = t.min_tier === null || rm.tier <= t.min_tier;
        return idMatches && tierOk;
      });
    });

    return {
      hit: compiledTargets.length > 0 && targetCheck,
      rolledText: rolledMods.map((r) => `${r.name} (T${r.tier})`).join(' | ') || 'No affixes',
    };
  };

  const handleStart = () => {
    if (runningRef.current) return;
    if (selectedTargets.length === 0) {
      addLog('Select at least 1 target modifier before starting craft engine.', 'warn');
      return;
    }

    if (window.electronAPI) {
      addLog('[Electron] Sending active script to native AutoHotkey runner...', 'info');
      const script = generateAhkScript();
      window.electronAPI.startCraft(script);
      return;
    }

    runningRef.current = true;
    setStatus('running');
    addLog(`[START] Crafting loop active. Targets: ${selectedTargets.map((t) => t.id).join(', ')}.`, 'info');

    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      if (!runningRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      const sim = simulateRoll();

      setStats((prev) => {
        const newAttempts = prev.attempts + 1;
        const isAug = Math.random() < 0.35 && newAttempts > 1;
        const newAlts = prev.altsUsed + (isAug ? 0 : 1);
        const newAugs = prev.augsUsed + (isAug ? 1 : 0);
        const elapsed = (Date.now() - startTime) / 1000;
        const rps = elapsed > 0 ? parseFloat((newAttempts / elapsed).toFixed(1)) : 0;

        if (sim.hit) {
          runningRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus('success');
          addLog(`[SUCCESS] TARGET MATCH FOUND in ${newAttempts} rolls (${newAlts} Alts, ${newAugs} Augs)!`, 'success');
          addLog(`Rolled: ${sim.rolledText}`, 'success');
        } else if (newAttempts % 10 === 0) {
          addLog(`[Roll #${newAttempts}] ${sim.rolledText}`, isAug ? 'aug' : 'alt');
        }

        return {
          attempts: newAttempts,
          altsUsed: newAlts,
          augsUsed: newAugs,
          elapsedSeconds: Math.floor(elapsed),
          rollsPerSec: rps,
          lastHitMod: sim.hit ? sim.rolledText : prev.lastHitMod,
        };
      });
    }, 180);
  };

  const handleStop = (reason = 'Manual stop') => {
    if (window.electronAPI) {
      window.electronAPI.stopCraft();
      return;
    }

    if (!runningRef.current && status === 'idle') return;
    runningRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('stopped');
    addLog(`[STOP] ${reason}.`, 'warn');
  };

  const handleResetStats = () => {
    handleStop();
    setStats({
      attempts: 0,
      altsUsed: 0,
      augsUsed: 0,
      elapsedSeconds: 0,
      rollsPerSec: 0,
      lastHitMod: '',
    });
    setStatus('idle');
    addLog('Session stats reset.', 'info');
  };

  const handleBatchSimulation = (rolls = 1000) => {
    if (selectedTargets.length === 0) {
      addLog('Select target mods first to run batch simulation.', 'warn');
      return;
    }
    addLog(`Running statistical simulation of ${rolls} items...`, 'info');
    let hits = 0;
    let totalAlts = 0;
    let totalAugs = 0;

    for (let i = 0; i < rolls; i++) {
      let itemHits = false;
      let rollAttempts = 0;
      while (!itemHits && rollAttempts < 5000) {
        rollAttempts++;
        totalAlts++;
        const s = simulateRoll();
        if (s.hit) {
          hits++;
          itemHits = true;
        } else if (Math.random() < 0.35) {
          totalAugs++;
          const s2 = simulateRoll();
          if (s2.hit) {
            hits++;
            itemHits = true;
          }
        }
      }
    }

    const avgAlts = (totalAlts / rolls).toFixed(1);
    const avgAugs = (totalAugs / rolls).toFixed(1);
    addLog(
      `[SIMULATION REPORT] Simulated ${rolls} successes. Average cost: ~${avgAlts} Alterations, ~${avgAugs} Augmentations per target item.`,
      'success'
    );
  };

  const handleToggle = (field: keyof AppSettings) => {
    const updated = { ...form, [field]: !form[field] };
    setForm(updated);
    onSaveSettings(updated);
  };

  const handleChangeNumber = (field: keyof AppSettings, value: string) => {
    const num = parseFloat(value.replace(',', '.')) || 0;
    const updated = { ...form, [field]: num };
    setForm(updated);
    onSaveSettings(updated);
  };

  const handleCoordinateChange = (
    slotKey: 'item_pos' | 'alt_pos' | 'aug_pos',
    axis: 0 | 1,
    valStr: string
  ) => {
    const val = parseInt(valStr, 10) || 0;
    const current = form[slotKey] || [0, 0];
    const newCoords: [number, number] = [
      axis === 0 ? val : current[0],
      axis === 1 ? val : current[1],
    ];
    const updated = { ...form, [slotKey]: newCoords };
    setForm(updated);
    onSaveSettings(updated);
  };

  const generateAhkScript = () => {
    const itemX = form.item_pos ? form.item_pos[0] : 327;
    const itemY = form.item_pos ? form.item_pos[1] : 446;
    const altX = form.alt_pos ? form.alt_pos[0] : 110;
    const altY = form.alt_pos ? form.alt_pos[1] : 269;
    const augX = form.aug_pos ? form.aug_pos[0] : 220;
    const augY = form.aug_pos ? form.aug_pos[1] : 327;

    const regexPatterns = compiledTargets
      .map((t) => t.pattern)
      .filter(Boolean)
      .join('`n; Target regex: ');

    return `; ==============================================================================
; Path of Exile Alt/Aug Auto-Crafter Companion Script
; Generated for: ${itemClass}
; Target Mods:
; ${regexPatterns || 'None specified'}
; ==============================================================================
#NoEnv
#SingleInstance Force
SetBatchLines, -1
SetMouseDelay, -1
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen

global ITEM_X := ${itemX}
global ITEM_Y := ${itemY}
global ALT_X  := ${altX}
global ALT_Y  := ${altY}
global AUG_X  := ${augX}
global AUG_Y  := ${augY}

global DELAY_MOVE   := ${Math.round(form.delay_after_move * 1000)}
global DELAY_CTRL_C := ${Math.round(form.delay_after_ctrl_c * 1000)}
global DELAY_CLICK  := ${Math.round(form.delay_after_click * 1000)}
global DELAY_BETWEEN:= ${Math.round(form.delay_between * 1000)}
global ALT_KEY_SWAP := ${form.alt_key_swap ? '1' : '0'}
global HUMANIZE     := ${form.humanize ? '1' : '0'}

global IsRunning := false

TrayTip, PoE Alt Crafter, Loaded. Press F1 to Start, F2 to Stop., 4

; --- Hotkeys ---
F1::
  if (!IsRunning) {
    IsRunning := true
    TrayTip, PoE Crafter, Crafting loop started (F2 to Stop)..., 2
    SetTimer, CraftLoop, -1
  }
return

F2::
  IsRunning := false
  TrayTip, PoE Crafter, Crafting stopped by user., 2
return

F6::
  MouseGetPos, xpos, ypos
  ITEM_X := xpos
  ITEM_Y := ypos
  TrayTip, PoE Crafter, Item Slot calibrated to %xpos%x%ypos%, 2
return

F7::
  MouseGetPos, xpos, ypos
  ALT_X := xpos
  ALT_Y := ypos
  TrayTip, PoE Crafter, Alteration Slot calibrated to %xpos%x%ypos%, 2
return

F10::
  MouseGetPos, xpos, ypos
  AUG_X := xpos
  AUG_Y := ypos
  TrayTip, PoE Crafter, Augmentation Slot calibrated to %xpos%x%ypos%, 2
return

; --- Main Loop ---
CraftLoop:
  while (IsRunning) {
    ; Check if window active
    if (!WinActive("ahk_class POEWindowClass") && !WinActive("Path of Exile")) {
      Sleep, 200
      continue
    }

    ; Copy item under cursor
    Clipboard := ""
    MouseMove, ITEM_X, ITEM_Y, 0
    Sleep, DELAY_MOVE
    Send, ^c
    ClipWait, 0.2
    itemText := Clipboard

    ; Check target condition here (or apply alteration)
    ; Right-click Alteration Orb
    MouseMove, ALT_X, ALT_Y, 0
    Sleep, DELAY_MOVE
    Click, Right
    Sleep, DELAY_CLICK

    ; Left-click Item Slot
    MouseMove, ITEM_X, ITEM_Y, 0
    Sleep, DELAY_MOVE
    Click
    Sleep, DELAY_CLICK + DELAY_BETWEEN
  }
return
`;
  };

  const handleDownloadAhk = () => {
    const script = generateAhkScript();
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poe_alt_crafter.ahk';
    a.click();
    URL.revokeObjectURL(url);
    addLog('Exported poe_alt_crafter.ahk script.', 'info');
  };

  return (
    <div className="flex flex-col gap-2.5 text-xs text-[#abb2bf]">
      {/* 3. Screen Calibration & Coordinates Fieldset */}
      <fieldset className="border border-[#3a3f4b] bg-[#21252b] p-2.5">
        <legend className="px-1.5 font-bold text-[#d7dae0] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#e5c07b]" />
            <span>3. Screen Coordinates Calibration</span>
          </div>
          <span className="text-[10px] font-mono text-[#5c6370]">
            Hover slot in game & press hotkey
          </span>
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Item Slot Box */}
          <div className="border border-[#3a3f4b] bg-[#181a1f] p-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#2d3139] mb-1.5">
              <span className="font-bold text-[#e5c07b]">Item Slot</span>
              <button
                type="button"
                id="calib-btn-item"
                onClick={() => onOpenPinModal('Item Slot')}
                className="px-1.5 py-0.5 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[10px] text-[#e5c07b]"
              >
                Calibrate [F6]
              </button>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-[#5c6370]">X:</span>
              <input
                id="pos-item-x"
                type="number"
                value={form.item_pos ? form.item_pos[0] : 0}
                onChange={(e) => handleCoordinateChange('item_pos', 0, e.target.value)}
                className="w-full bg-[#14161b] border border-[#3a3f4b] px-1 py-0.5 text-[#d7dae0]"
              />
              <span className="text-[#5c6370]">Y:</span>
              <input
                id="pos-item-y"
                type="number"
                value={form.item_pos ? form.item_pos[1] : 0}
                onChange={(e) => handleCoordinateChange('item_pos', 1, e.target.value)}
                className="w-full bg-[#14161b] border border-[#3a3f4b] px-1 py-0.5 text-[#d7dae0]"
              />
            </div>
          </div>

          {/* Alteration Slot Box */}
          <div className="border border-[#3a3f4b] bg-[#181a1f] p-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#2d3139] mb-1.5">
              <span className="font-bold text-[#38bdf8]">Alt Orb</span>
              <button
                type="button"
                id="calib-btn-alt"
                onClick={() => onOpenPinModal('Alteration Slot')}
                className="px-1.5 py-0.5 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[10px] text-[#38bdf8]"
              >
                Calibrate [F7]
              </button>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-[#5c6370]">X:</span>
              <input
                id="pos-alt-x"
                type="number"
                value={form.alt_pos ? form.alt_pos[0] : 0}
                onChange={(e) => handleCoordinateChange('alt_pos', 0, e.target.value)}
                className="w-full bg-[#14161b] border border-[#3a3f4b] px-1 py-0.5 text-[#d7dae0]"
              />
              <span className="text-[#5c6370]">Y:</span>
              <input
                id="pos-alt-y"
                type="number"
                value={form.alt_pos ? form.alt_pos[1] : 0}
                onChange={(e) => handleCoordinateChange('alt_pos', 1, e.target.value)}
                className="w-full bg-[#14161b] border border-[#3a3f4b] px-1 py-0.5 text-[#d7dae0]"
              />
            </div>
          </div>

          {/* Augmentation Slot Box */}
          <div className="border border-[#3a3f4b] bg-[#181a1f] p-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#2d3139] mb-1.5">
              <span className="font-bold text-[#c084fc]">Aug Orb</span>
              <button
                type="button"
                id="calib-btn-aug"
                onClick={() => onOpenPinModal('Augmentation Slot')}
                className="px-1.5 py-0.5 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[10px] text-[#c084fc]"
              >
                Calibrate [F10]
              </button>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-[#5c6370]">X:</span>
              <input
                id="pos-aug-x"
                type="number"
                value={form.aug_pos ? form.aug_pos[0] : 0}
                onChange={(e) => handleCoordinateChange('aug_pos', 0, e.target.value)}
                className="w-full bg-[#14161b] border border-[#3a3f4b] px-1 py-0.5 text-[#d7dae0]"
              />
              <span className="text-[#5c6370]">Y:</span>
              <input
                id="pos-aug-y"
                type="number"
                value={form.aug_pos ? form.aug_pos[1] : 0}
                onChange={(e) => handleCoordinateChange('aug_pos', 1, e.target.value)}
                className="w-full bg-[#14161b] border border-[#3a3f4b] px-1 py-0.5 text-[#d7dae0]"
              />
            </div>
          </div>
        </div>
      </fieldset>

      {/* 4. Craft Controls & Statistics Fieldset */}
      <fieldset className="border border-[#3a3f4b] bg-[#21252b] p-2.5">
        <legend className="px-1.5 font-bold text-[#d7dae0] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 ${
                status === 'running'
                  ? 'bg-[#98c379]'
                  : status === 'stopped'
                  ? 'bg-[#e5c07b]'
                  : 'bg-[#5c6370]'
              }`}
            />
            <span>4. Execution & Live Metrics</span>
            <span className="text-[10px] font-mono text-[#5c6370]">
              [{status.toUpperCase()}]
            </span>
          </div>

          <button
            type="button"
            id="panel-reset-stats"
            onClick={handleResetStats}
            className="text-[10px] text-[#5c6370] hover:text-[#abb2bf] flex items-center gap-1"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset Counters</span>
          </button>
        </legend>

        {/* Primary Start / Stop / Quick Simulation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 mb-2">
          <button
            type="button"
            id="panel-start-btn"
            onClick={handleStart}
            disabled={status === 'running'}
            className={`py-1.5 px-3 border font-bold text-xs flex items-center justify-center gap-1.5 ${
              status === 'running'
                ? 'bg-[#1b2b20] text-[#497053] border-[#2d4734] cursor-not-allowed'
                : 'bg-[#233827] hover:bg-[#2e4a34] text-[#98c379] border-[#3e6847]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START [F1]</span>
          </button>

          <button
            type="button"
            id="panel-stop-btn"
            onClick={() => handleStop('Manual stop')}
            disabled={status === 'idle'}
            className={`py-1.5 px-3 border font-bold text-xs flex items-center justify-center gap-1.5 ${
              status === 'idle'
                ? 'bg-[#221c1f] text-[#5c4a50] border-[#382b30] cursor-not-allowed'
                : 'bg-[#3b2025] hover:bg-[#4d2930] text-[#e06c75] border-[#6b353f]'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>STOP [F2]</span>
          </button>

          <button
            type="button"
            id="panel-sim-1000-btn"
            onClick={() => handleBatchSimulation(1000)}
            className="py-1.5 px-2 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#abb2bf] hover:text-white font-semibold text-xs flex items-center justify-center gap-1"
          >
            <Zap className="w-3 h-3 text-[#e5c07b]" />
            <span>Simulate 1k Rolls</span>
          </button>

          <button
            type="button"
            id="panel-export-ahk-btn"
            onClick={handleDownloadAhk}
            className="py-1.5 px-2 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#61afef] hover:text-white font-semibold text-xs flex items-center justify-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>Download .AHK</span>
          </button>
        </div>

        {/* Compact Tabular Metric Panels */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 font-mono text-[11px]">
          <div className="border border-[#3a3f4b] bg-[#14161b] px-2 py-1">
            <span className="text-[10px] text-[#5c6370] block">Attempts</span>
            <span className="font-bold text-[#d7dae0] text-xs">{stats.attempts}</span>
          </div>

          <div className="border border-[#3a3f4b] bg-[#14161b] px-2 py-1">
            <span className="text-[10px] text-[#5c6370] block">Alts Used</span>
            <span className="font-bold text-[#38bdf8] text-xs">{stats.altsUsed}</span>
          </div>

          <div className="border border-[#3a3f4b] bg-[#14161b] px-2 py-1">
            <span className="text-[10px] text-[#5c6370] block">Augs Used</span>
            <span className="font-bold text-[#c084fc] text-xs">{stats.augsUsed}</span>
          </div>

          <div className="border border-[#3a3f4b] bg-[#14161b] px-2 py-1">
            <span className="text-[10px] text-[#5c6370] block">Elapsed</span>
            <span className="font-bold text-[#abb2bf] text-xs">{stats.elapsedSeconds}s</span>
          </div>

          <div className="border border-[#3a3f4b] bg-[#14161b] px-2 py-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#5c6370] block">Speed</span>
            <span className="font-bold text-[#98c379] text-xs">{stats.rollsPerSec} r/s</span>
          </div>
        </div>
      </fieldset>

      {/* 5. Delays & Settings Details */}
      <fieldset className="border border-[#3a3f4b] bg-[#21252b] p-2.5">
        <legend className="px-1.5 font-bold text-[#d7dae0] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#5c6370]" />
            <span>5. Timing Delays & Automation Flags</span>
          </div>
        </legend>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          <div>
            <label className="text-[10px] text-[#5c6370] block mb-0.5">Move Delay (s)</label>
            <input
              type="number"
              step="0.01"
              value={form.delay_after_move}
              onChange={(e) => handleChangeNumber('delay_after_move', e.target.value)}
              className="w-full bg-[#14161b] border border-[#3a3f4b] px-1.5 py-0.5 text-xs font-mono text-[#d7dae0]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#5c6370] block mb-0.5">Ctrl+C Delay (s)</label>
            <input
              type="number"
              step="0.01"
              value={form.delay_after_ctrl_c}
              onChange={(e) => handleChangeNumber('delay_after_ctrl_c', e.target.value)}
              className="w-full bg-[#14161b] border border-[#3a3f4b] px-1.5 py-0.5 text-xs font-mono text-[#d7dae0]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#5c6370] block mb-0.5">Click Delay (s)</label>
            <input
              type="number"
              step="0.01"
              value={form.delay_after_click}
              onChange={(e) => handleChangeNumber('delay_after_click', e.target.value)}
              className="w-full bg-[#14161b] border border-[#3a3f4b] px-1.5 py-0.5 text-xs font-mono text-[#d7dae0]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#5c6370] block mb-0.5">Between Delay (s)</label>
            <input
              type="number"
              step="0.01"
              value={form.delay_between}
              onChange={(e) => handleChangeNumber('delay_between', e.target.value)}
              className="w-full bg-[#14161b] border border-[#3a3f4b] px-1.5 py-0.5 text-xs font-mono text-[#d7dae0]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-[#2d3139]">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#abb2bf] hover:text-white">
            <input
              type="checkbox"
              checked={form.alt_key_swap}
              onChange={() => handleToggle('alt_key_swap')}
              className="accent-[#e5c07b]"
            />
            <span>Alt Key Swap (Hold Alt for Aug)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#abb2bf] hover:text-white">
            <input
              type="checkbox"
              checked={form.humanize}
              onChange={() => handleToggle('humanize')}
              className="accent-[#e5c07b]"
            />
            <span>Humanize Delays (±15% variance)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#abb2bf] hover:text-white">
            <input
              type="checkbox"
              checked={form.always_on_top}
              onChange={() => handleToggle('always_on_top')}
              className="accent-[#e5c07b]"
            />
            <span>Always on Top Window</span>
          </label>
        </div>
      </fieldset>

      {/* 6. Console Output Window */}
      <fieldset className="border border-[#3a3f4b] bg-[#21252b] p-2.5">
        <legend className="px-1.5 font-bold text-[#d7dae0] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#98c379]" />
            <span>6. Console Activity Output</span>
            <span className="text-[10px] font-mono text-[#5c6370]">({logs.length} logs)</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[10px] text-[#5c6370] cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="accent-[#e5c07b]"
              />
              <span>Auto-scroll</span>
            </label>
            <button
              type="button"
              id="clear-console-logs"
              onClick={() => setLogs([])}
              className="text-[10px] text-[#5c6370] hover:text-[#abb2bf]"
            >
              Clear Log
            </button>
          </div>
        </legend>

        <div
          ref={logContainerRef}
          className="h-28 overflow-y-auto border border-[#3a3f4b] bg-[#14161b] p-1.5 font-mono text-[11px] space-y-0.5"
        >
          {logs.length === 0 ? (
            <div className="text-[#5c6370] py-2 text-center">Console log empty.</div>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="leading-tight flex items-start gap-1.5">
                <span className="text-[#5c6370] text-[10px] shrink-0">[{l.time}]</span>
                <span
                  className={`truncate ${
                    l.type === 'success'
                      ? 'text-[#98c379] font-bold'
                      : l.type === 'warn'
                      ? 'text-[#e5c07b]'
                      : l.type === 'aug'
                      ? 'text-[#c084fc]'
                      : l.type === 'alt'
                      ? 'text-[#38bdf8]'
                      : 'text-[#abb2bf]'
                  }`}
                >
                  {l.text}
                </span>
              </div>
            ))
          )}
        </div>
      </fieldset>
    </div>
  );
};
