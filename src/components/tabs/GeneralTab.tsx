import React from 'react';
import {
  Download,
  Upload,
  FileCode,
  CheckSquare,
  Clock,
  Keyboard,
  ShieldCheck,
  Volume2,
  Sliders,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface GeneralTabProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onExportAhk: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onSaveSettings,
  onExportAhk,
  onExportJson,
  onImportJson,
}) => {
  const handleChangeNumber = (field: keyof AppSettings, valStr: string) => {
    const num = parseFloat(valStr.replace(',', '.')) || 0;
    onSaveSettings({ ...settings, [field]: num });
  };

  const handleToggle = (field: keyof AppSettings) => {
    onSaveSettings({ ...settings, [field]: !settings[field] });
  };

  return (
    <div className="flex-1 flex flex-col p-3 text-xs text-[#cbd5e1] gap-3 select-none overflow-y-auto bg-[#171b26]">
      {/* 1. General Settings with Checkboxes (Настройки с галочками) */}
      <div className="bg-[#191f2c] border border-[#273043] p-3">
        <div className="flex items-center gap-2 font-bold text-white mb-2.5 pb-1 border-b border-[#212838]">
          <CheckSquare className="w-4 h-4 text-[#38bdf8]" />
          <span>General Automation Options (Настройки крафтера)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Alt Key Swap */}
          <label className="flex items-start gap-2.5 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#3891d4] transition-colors">
            <input
              type="checkbox"
              checked={settings.alt_key_swap}
              onChange={() => handleToggle('alt_key_swap')}
              className="accent-[#1d72b8] mt-0.5 w-4 h-4 rounded-none cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-white">Alt Key Swap</span>
              <span className="text-[10px] text-[#64748b]">
                Hold Alt key during Augmentation to prevent item pickup.
              </span>
            </div>
          </label>

          {/* Humanize Delays */}
          <label className="flex items-start gap-2.5 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#3891d4] transition-colors">
            <input
              type="checkbox"
              checked={settings.humanize}
              onChange={() => handleToggle('humanize')}
              className="accent-[#1d72b8] mt-0.5 w-4 h-4 rounded-none cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-white">Humanize Delays</span>
              <span className="text-[10px] text-[#64748b]">
                Adds natural ±15% variance to click intervals.
              </span>
            </div>
          </label>

          {/* Always on Top */}
          <label className="flex items-start gap-2.5 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#3891d4] transition-colors">
            <input
              type="checkbox"
              checked={settings.always_on_top}
              onChange={() => handleToggle('always_on_top')}
              className="accent-[#1d72b8] mt-0.5 w-4 h-4 rounded-none cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-white">Always on Top</span>
              <span className="text-[10px] text-[#64748b]">
                Keep Crafter window floating above Path of Exile.
              </span>
            </div>
          </label>

          {/* Sound Alert on Hit */}
          <label className="flex items-start gap-2.5 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#3891d4] transition-colors">
            <input
              type="checkbox"
              checked={settings.sound_alert ?? true}
              onChange={() => handleToggle('sound_alert')}
              className="accent-[#1d72b8] mt-0.5 w-4 h-4 rounded-none cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-white">Sound Alert on Hit</span>
              <span className="text-[10px] text-[#64748b]">
                Plays notification chime when target modifiers roll.
              </span>
            </div>
          </label>

          {/* Pause on Unfocus */}
          <label className="flex items-start gap-2.5 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#3891d4] transition-colors">
            <input
              type="checkbox"
              checked={settings.pause_on_unfocus ?? true}
              onChange={() => handleToggle('pause_on_unfocus')}
              className="accent-[#1d72b8] mt-0.5 w-4 h-4 rounded-none cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-white">Pause on Tab Switch</span>
              <span className="text-[10px] text-[#64748b]">
                Instantly halt crafting loop if PoE window loses active focus.
              </span>
            </div>
          </label>

          {/* Auto-Augment Single Mod */}
          <label className="flex items-start gap-2.5 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#3891d4] transition-colors">
            <input
              type="checkbox"
              checked={settings.auto_aug ?? true}
              onChange={() => handleToggle('auto_aug')}
              className="accent-[#1d72b8] mt-0.5 w-4 h-4 rounded-none cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-white">Auto-Augment 1-Mod Items</span>
              <span className="text-[10px] text-[#64748b]">
                Automatically apply Augmentation Orb if 1 desired affix rolls.
              </span>
            </div>
          </label>

          {/* Currency Limit */}
          <label className="flex items-start gap-2.5 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#3891d4] transition-colors">
            <input
              type="checkbox"
              checked={settings.currency_limit_enabled}
              onChange={() => handleToggle('currency_limit_enabled')}
              className="accent-[#1d72b8] mt-0.5 w-4 h-4 rounded-none cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-white">Currency Limit Protection</span>
              <span className="text-[10px] text-[#64748b]">
                Stop crafting when total spent exceeds limit ({settings.currency_limit}).
              </span>
            </div>
          </label>

          {/* Log All Rolls */}
          <label className="flex items-start gap-2.5 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#3891d4] transition-colors">
            <input
              type="checkbox"
              checked={settings.log_all_rolls ?? true}
              onChange={() => handleToggle('log_all_rolls')}
              className="accent-[#1d72b8] mt-0.5 w-4 h-4 rounded-none cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-white">Log Rolls to Console</span>
              <span className="text-[10px] text-[#64748b]">
                Output item affix data and roll results to bottom console window.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Timing Delays & Latency */}
      <div className="bg-[#191f2c] border border-[#273043] p-3">
        <div className="flex items-center gap-2 font-bold text-white mb-2 pb-1 border-b border-[#212838]">
          <Clock className="w-4 h-4 text-[#e5c07b]" />
          <span>Automation Timings & Delays (Секунды)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div className="bg-[#0e1219] border border-[#273043] p-2">
            <label className="text-[10px] text-[#94a3b8] block mb-1">Move Delay</label>
            <input
              type="number"
              step="0.01"
              value={settings.delay_after_move}
              onChange={(e) => handleChangeNumber('delay_after_move', e.target.value)}
              className="w-full bg-[#161a25] border border-[#273043] px-2 py-1 text-white text-xs text-center"
            />
          </div>

          <div className="bg-[#0e1219] border border-[#273043] p-2">
            <label className="text-[10px] text-[#94a3b8] block mb-1">Ctrl+C Delay</label>
            <input
              type="number"
              step="0.01"
              value={settings.delay_after_ctrl_c}
              onChange={(e) => handleChangeNumber('delay_after_ctrl_c', e.target.value)}
              className="w-full bg-[#161a25] border border-[#273043] px-2 py-1 text-white text-xs text-center"
            />
          </div>

          <div className="bg-[#0e1219] border border-[#273043] p-2">
            <label className="text-[10px] text-[#94a3b8] block mb-1">Click Delay</label>
            <input
              type="number"
              step="0.01"
              value={settings.delay_after_click}
              onChange={(e) => handleChangeNumber('delay_after_click', e.target.value)}
              className="w-full bg-[#161a25] border border-[#273043] px-2 py-1 text-white text-xs text-center"
            />
          </div>

          <div className="bg-[#0e1219] border border-[#273043] p-2">
            <label className="text-[10px] text-[#94a3b8] block mb-1">Loop Delay</label>
            <input
              type="number"
              step="0.01"
              value={settings.delay_between}
              onChange={(e) => handleChangeNumber('delay_between', e.target.value)}
              className="w-full bg-[#161a25] border border-[#273043] px-2 py-1 text-white text-xs text-center"
            />
          </div>
        </div>
      </div>

      {/* 3. Hotkeys Reference Table */}
      <div className="bg-[#191f2c] border border-[#273043] p-3">
        <div className="flex items-center gap-1.5 font-bold text-white mb-2">
          <Keyboard className="w-4 h-4 text-[#38bdf8]" />
          <span>Hotkeys Reference (Горячие клавиши)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-[11px]">
          <div className="bg-[#0e1219] border border-[#273043] p-1.5 text-center">
            <span className="font-bold text-[#98c379] block">F1</span>
            <span className="text-[10px] text-[#cbd5e1]">Start / Resume</span>
          </div>
          <div className="bg-[#0e1219] border border-[#273043] p-1.5 text-center">
            <span className="font-bold text-[#f87171] block">F2</span>
            <span className="text-[10px] text-[#cbd5e1]">Emergency Stop</span>
          </div>
          <div className="bg-[#0e1219] border border-[#273043] p-1.5 text-center">
            <span className="font-bold text-[#e5c07b] block">F6</span>
            <span className="text-[10px] text-[#cbd5e1]">Set Item Pos</span>
          </div>
          <div className="bg-[#0e1219] border border-[#273043] p-1.5 text-center">
            <span className="font-bold text-[#38bdf8] block">F7</span>
            <span className="text-[10px] text-[#cbd5e1]">Set Alt Pos</span>
          </div>
          <div className="bg-[#0e1219] border border-[#273043] p-1.5 text-center">
            <span className="font-bold text-[#c084fc] block">F10</span>
            <span className="text-[10px] text-[#cbd5e1]">Set Aug Pos</span>
          </div>
        </div>
      </div>

      {/* 4. Configuration & AutoHotkey Script */}
      <div className="bg-[#191f2c] border border-[#273043] p-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-bold text-white">AutoHotkey Companion & Profiles</div>
          <div className="text-[11px] text-[#64748b]">
            Download the standalone `.ahk` script or save your profile configurations.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportAhk}
            className="px-3 py-1.5 bg-[#1872b8] hover:bg-[#1f7ec8] border border-[#3891d4] text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .AHK</span>
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="px-3 py-1.5 bg-[#242c3d] hover:bg-[#2d374d] border border-[#37435d] text-white flex items-center gap-1.5 font-semibold"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={onImportJson}
            className="px-3 py-1.5 bg-[#242c3d] hover:bg-[#2d374d] border border-[#37435d] text-white flex items-center gap-1.5 font-semibold"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
