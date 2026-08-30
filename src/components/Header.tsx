import React, { useState } from 'react';
import {
  Play,
  Square,
  Crosshair,
  FileCode,
  Download,
  Upload,
  RotateCcw,
  HelpCircle,
  Copy,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenPinModal: (slotName: string) => void;
  onSelectPreset: (presetName: string) => void;
  onExportAhk: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onResetStats: () => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  itemClass: string;
  setItemClass: (cls: string) => void;
  classIds: string[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenPinModal,
  onSelectPreset,
  onExportAhk,
  onExportJson,
  onImportJson,
  onResetStats,
  isRunning,
  onStart,
  onStop,
  itemClass,
  setItemClass,
  classIds,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const closeMenu = () => setOpenMenu(null);

  return (
    <header className="bg-[#21252b] border-b border-[#3a3f4b] text-[#abb2bf] select-none text-xs sticky top-0 z-40">
      {/* 1. Classic Desktop Window Title & Menu Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#181a1f] border-b border-[#2d3139]">
        <div className="flex items-center gap-4">
          {/* App Title */}
          <div className="flex items-center gap-1.5 font-bold text-[#d7dae0] tracking-tight">
            <span className="w-2.5 h-2.5 bg-[#e5c07b] inline-block border border-[#d19a66]" />
            <span>PoE Alt/Aug Crafter v1.0</span>
          </div>

          {/* Classic File / Edit / Tools / Help Menus */}
          <div className="flex items-center">
            {/* File Menu */}
            <div className="relative">
              <button
                type="button"
                id="menu-file-btn"
                onClick={() => toggleMenu('file')}
                className={`px-2 py-0.5 hover:bg-[#282c34] hover:text-white ${
                  openMenu === 'file' ? 'bg-[#282c34] text-white' : ''
                }`}
              >
                File
              </button>
              {openMenu === 'file' && (
                <div
                  className="absolute left-0 top-full mt-0.5 w-48 bg-[#21252b] border border-[#3a3f4b] shadow-lg py-1 z-50 text-xs"
                  onMouseLeave={closeMenu}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onExportAhk();
                      closeMenu();
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#2c313a] text-[#abb2bf] hover:text-white flex items-center justify-between"
                  >
                    <span>Export AHK Script</span>
                    <span className="text-[10px] text-[#5c6370]">.ahk</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportJson();
                      closeMenu();
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#2c313a] text-[#abb2bf] hover:text-white flex items-center justify-between"
                  >
                    <span>Save Settings</span>
                    <span className="text-[10px] text-[#5c6370]">.json</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onImportJson();
                      closeMenu();
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#2c313a] text-[#abb2bf] hover:text-white flex items-center justify-between"
                  >
                    <span>Load Settings...</span>
                  </button>
                  <div className="border-t border-[#3a3f4b] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      onResetStats();
                      closeMenu();
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#2c313a] text-[#abb2bf] hover:text-white"
                  >
                    Reset Statistics
                  </button>
                </div>
              )}
            </div>

            {/* Presets Menu */}
            <div className="relative">
              <button
                type="button"
                id="menu-presets-btn"
                onClick={() => toggleMenu('presets')}
                className={`px-2 py-0.5 hover:bg-[#282c34] hover:text-white ${
                  openMenu === 'presets' ? 'bg-[#282c34] text-white' : ''
                }`}
              >
                Presets
              </button>
              {openMenu === 'presets' && (
                <div
                  className="absolute left-0 top-full mt-0.5 w-64 bg-[#21252b] border border-[#3a3f4b] shadow-lg py-1 z-50 text-xs"
                  onMouseLeave={closeMenu}
                >
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase text-[#5c6370] tracking-wider">
                    Popular Crafting Targets
                  </div>
                  {[
                    { name: '+1 All Spell Skill Gems (Amulet)', cls: 'Amulet' },
                    { name: 'T1 Life + T1 Fire Resistance', cls: 'Body Armour' },
                    { name: '35% Movement Speed + T1 Life', cls: 'Boots' },
                    { name: 'T1 Flaring Phys + Merciless % Phys', cls: 'Bow' },
                    { name: 'T1 Spell Damage + T1 Cast Speed', cls: 'Wand' },
                    { name: 'T1 Life + T1 Chaos Resistance', cls: 'Ring' },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        onSelectPreset(p.name);
                        closeMenu();
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#2c313a] text-[#abb2bf] hover:text-white truncate"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Calibrate Menu */}
            <div className="relative">
              <button
                type="button"
                id="menu-calibrate-btn"
                onClick={() => toggleMenu('calibrate')}
                className={`px-2 py-0.5 hover:bg-[#282c34] hover:text-white ${
                  openMenu === 'calibrate' ? 'bg-[#282c34] text-white' : ''
                }`}
              >
                Calibration
              </button>
              {openMenu === 'calibrate' && (
                <div
                  className="absolute left-0 top-full mt-0.5 w-52 bg-[#21252b] border border-[#3a3f4b] shadow-lg py-1 z-50 text-xs"
                  onMouseLeave={closeMenu}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPinModal('Item Slot');
                      closeMenu();
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#2c313a] text-[#abb2bf] hover:text-white flex items-center justify-between"
                  >
                    <span>Calibrate Item Slot</span>
                    <span className="font-mono text-[10px] text-[#e5c07b]">F6</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPinModal('Alteration Slot');
                      closeMenu();
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#2c313a] text-[#abb2bf] hover:text-white flex items-center justify-between"
                  >
                    <span>Calibrate Alt Slot</span>
                    <span className="font-mono text-[10px] text-[#38bdf8]">F7</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPinModal('Augmentation Slot');
                      closeMenu();
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#2c313a] text-[#abb2bf] hover:text-white flex items-center justify-between"
                  >
                    <span>Calibrate Aug Slot</span>
                    <span className="font-mono text-[10px] text-[#c084fc]">F10</span>
                  </button>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <button
              type="button"
              id="menu-help-btn"
              onClick={onOpenHelp}
              className="px-2 py-0.5 hover:bg-[#282c34] hover:text-white"
            >
              Help & Rules
            </button>
          </div>
        </div>

        {/* Item Base Selector in Menu Header */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="quick-item-class" className="text-[11px] text-[#5c6370]">
            Base:
          </label>
          <select
            id="quick-item-class"
            value={itemClass}
            onChange={(e) => setItemClass(e.target.value)}
            className="bg-[#14161b] border border-[#3a3f4b] text-[#d7dae0] px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#e5c07b]"
          >
            {classIds.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Classic Utility Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 bg-[#21252b] border-b border-[#2d3139]">
        {/* Left Toolbar Buttons */}
        <div className="flex items-center gap-1">
          {/* Start Button */}
          <button
            id="tb-start-btn"
            type="button"
            onClick={onStart}
            disabled={isRunning}
            className={`px-3 py-1 font-semibold text-xs border flex items-center gap-1.5 transition-colors ${
              isRunning
                ? 'bg-[#1b2b20] text-[#497053] border-[#2d4734] cursor-not-allowed'
                : 'bg-[#233827] hover:bg-[#2e4a34] text-[#98c379] border-[#3e6847] active:bg-[#1a2d1e]'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>START (F1)</span>
          </button>

          {/* Stop Button */}
          <button
            id="tb-stop-btn"
            type="button"
            onClick={onStop}
            disabled={!isRunning}
            className={`px-3 py-1 font-semibold text-xs border flex items-center gap-1.5 transition-colors ${
              !isRunning
                ? 'bg-[#221c1f] text-[#5c4a50] border-[#382b30] cursor-not-allowed'
                : 'bg-[#3b2025] hover:bg-[#4d2930] text-[#e06c75] border-[#6b353f] active:bg-[#2d181c]'
            }`}
          >
            <Square className="w-3 h-3 fill-current" />
            <span>STOP (F2)</span>
          </button>

          <div className="h-4 w-[1px] bg-[#3a3f4b] mx-1" />

          {/* Calibrate Buttons */}
          <button
            type="button"
            id="tb-calib-f6"
            onClick={() => onOpenPinModal('Item Slot')}
            className="px-2 py-1 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#abb2bf] hover:text-white flex items-center gap-1"
            title="Calibrate Item Screen Slot (F6)"
          >
            <Crosshair className="w-3 h-3 text-[#e5c07b]" />
            <span>Item (F6)</span>
          </button>

          <button
            type="button"
            id="tb-calib-f7"
            onClick={() => onOpenPinModal('Alteration Slot')}
            className="px-2 py-1 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#abb2bf] hover:text-white flex items-center gap-1"
            title="Calibrate Alteration Orb Slot (F7)"
          >
            <Crosshair className="w-3 h-3 text-[#38bdf8]" />
            <span>Alt (F7)</span>
          </button>

          <button
            type="button"
            id="tb-calib-f10"
            onClick={() => onOpenPinModal('Augmentation Slot')}
            className="px-2 py-1 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#abb2bf] hover:text-white flex items-center gap-1"
            title="Calibrate Augmentation Orb Slot (F10)"
          >
            <Crosshair className="w-3 h-3 text-[#c084fc]" />
            <span>Aug (F10)</span>
          </button>

          <div className="h-4 w-[1px] bg-[#3a3f4b] mx-1" />

          {/* Script Exports */}
          <button
            type="button"
            id="tb-export-ahk"
            onClick={onExportAhk}
            className="px-2 py-1 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#abb2bf] hover:text-white flex items-center gap-1"
            title="Export AutoHotkey v1/v2 Script"
          >
            <FileCode className="w-3 h-3 text-[#61afef]" />
            <span>Export .AHK</span>
          </button>

          <button
            type="button"
            id="tb-reset-btn"
            onClick={onResetStats}
            className="px-2 py-1 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-[#abb2bf] hover:text-white flex items-center gap-1"
            title="Reset counter and statistics"
          >
            <RotateCcw className="w-3 h-3 text-[#5c6370]" />
            <span>Reset Stats</span>
          </button>
        </div>

        {/* Hotkey reminder tag */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#5c6370]">
          <span>F1 Start</span>
          <span>·</span>
          <span>F2 Stop</span>
          <span>·</span>
          <span>F6/F7/F10 Positions</span>
        </div>
      </div>
    </header>
  );
};

