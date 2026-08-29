import React, { useState } from 'react';
import { Map, ShieldAlert, Sparkles, Sliders, CheckCircle2, Lock } from 'lucide-react';

export const MapCraftTab: React.FC = () => {
  const [mapTier, setMapTier] = useState<number>(16);
  const [useChisel, setUseChisel] = useState<boolean>(true);
  const [useAlch, setUseAlch] = useState<boolean>(true);
  const [useChaosSpam, setUseChaosSpam] = useState<boolean>(false);
  const [minQuant, setMinQuant] = useState<number>(80);
  const [minPackSize, setMinPackSize] = useState<number>(25);

  // Blacklisted mods checkboxes
  const [blacklistPhysReflect, setBlacklistPhysReflect] = useState<boolean>(true);
  const [blacklistEleReflect, setBlacklistEleReflect] = useState<boolean>(true);
  const [blacklistNoRegen, setBlacklistNoRegen] = useState<boolean>(true);
  const [blacklistMinusMax, setBlacklistMinusMax] = useState<boolean>(false);
  const [blacklistNoLeech, setBlacklistNoLeech] = useState<boolean>(false);
  const [blacklistTempChains, setBlacklistTempChains] = useState<boolean>(false);

  return (
    <div className="flex-1 flex flex-col p-3 text-xs text-[#cbd5e1] gap-3 select-none overflow-y-auto bg-[#171b26]">
      {/* Banner / Info */}
      <div className="bg-[#191f2c] border border-[#273043] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Map className="w-5 h-5 text-[#e06c75]" />
          <div>
            <div className="font-bold text-white text-sm">Map Craft (Reserved for Future)</div>
            <div className="text-[11px] text-[#64748b]">
              Automatic map rolling: Cartographer's Chisel, Orb of Alchemy, Chaos spam with mod blacklist filter.
            </div>
          </div>
        </div>
        <div className="px-2 py-0.5 bg-[#2d1c1c] text-[#e06c75] border border-[#522b2b] text-[10px] font-mono font-bold">
          FUTURE MODULE
        </div>
      </div>

      {/* 1. Map Roll Parameters */}
      <div className="bg-[#191f2c] border border-[#273043] p-3">
        <div className="font-bold text-white mb-2.5 pb-1 border-b border-[#212838] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#fbbf24]" />
          <span>Map Rolling Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer">
            <input
              type="checkbox"
              checked={useChisel}
              onChange={(e) => setUseChisel(e.target.checked)}
              className="accent-[#1d72b8]"
            />
            <span className="text-white">Auto Chisel to 20% Quality</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer">
            <input
              type="checkbox"
              checked={useAlch}
              onChange={(e) => setUseAlch(e.target.checked)}
              className="accent-[#1d72b8]"
            />
            <span className="text-white">Scour + Alchemy Loop</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer">
            <input
              type="checkbox"
              checked={useChaosSpam}
              onChange={(e) => setUseChaosSpam(e.target.checked)}
              className="accent-[#1d72b8]"
            />
            <span className="text-white">Chaos Orb Re-roll</span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2.5">
          <div className="bg-[#0e1219] border border-[#273043] p-2">
            <label className="text-[10px] text-[#94a3b8] block mb-1">Target Map Tier</label>
            <input
              type="number"
              value={mapTier}
              onChange={(e) => setMapTier(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-[#161a25] border border-[#273043] px-2 py-1 text-white font-mono text-xs"
            />
          </div>

          <div className="bg-[#0e1219] border border-[#273043] p-2">
            <label className="text-[10px] text-[#94a3b8] block mb-1">Min Item Quantity (%)</label>
            <input
              type="number"
              value={minQuant}
              onChange={(e) => setMinQuant(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#161a25] border border-[#273043] px-2 py-1 text-white font-mono text-xs"
            />
          </div>

          <div className="bg-[#0e1219] border border-[#273043] p-2">
            <label className="text-[10px] text-[#94a3b8] block mb-1">Min Pack Size (%)</label>
            <input
              type="number"
              value={minPackSize}
              onChange={(e) => setMinPackSize(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#161a25] border border-[#273043] px-2 py-1 text-white font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. Mod Blacklist */}
      <div className="bg-[#191f2c] border border-[#273043] p-3">
        <div className="font-bold text-white mb-2.5 pb-1 border-b border-[#212838] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#f87171]" />
          <span>Dangerous Mod Blacklist (Re-roll if rolled)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#f87171]/50">
            <input
              type="checkbox"
              checked={blacklistPhysReflect}
              onChange={(e) => setBlacklistPhysReflect(e.target.checked)}
              className="accent-[#ef4444]"
            />
            <span className="text-[#f87171]">Monsters reflect Physical Damage</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#f87171]/50">
            <input
              type="checkbox"
              checked={blacklistEleReflect}
              onChange={(e) => setBlacklistEleReflect(e.target.checked)}
              className="accent-[#ef4444]"
            />
            <span className="text-[#f87171]">Monsters reflect Elemental Damage</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#f87171]/50">
            <input
              type="checkbox"
              checked={blacklistNoRegen}
              onChange={(e) => setBlacklistNoRegen(e.target.checked)}
              className="accent-[#ef4444]"
            />
            <span className="text-[#f87171]">Players cannot Regenerate Life or Mana</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#f87171]/50">
            <input
              type="checkbox"
              checked={blacklistMinusMax}
              onChange={(e) => setBlacklistMinusMax(e.target.checked)}
              className="accent-[#ef4444]"
            />
            <span className="text-[#f87171]">-% Maximum Player Resistances</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#f87171]/50">
            <input
              type="checkbox"
              checked={blacklistNoLeech}
              onChange={(e) => setBlacklistNoLeech(e.target.checked)}
              className="accent-[#ef4444]"
            />
            <span className="text-[#f87171]">Players cannot Leech Life or Mana</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#0e1219] border border-[#273043] cursor-pointer hover:border-[#f87171]/50">
            <input
              type="checkbox"
              checked={blacklistTempChains}
              onChange={(e) => setBlacklistTempChains(e.target.checked)}
              className="accent-[#ef4444]"
            />
            <span className="text-[#f87171]">Players are Cursed with Temporal Chains</span>
          </label>
        </div>
      </div>
    </div>
  );
};
