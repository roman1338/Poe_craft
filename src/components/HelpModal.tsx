import React, { useState } from 'react';
import { X, BookOpen, BrainCircuit, Database, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeGuideTab, setActiveGuideTab] = useState<'logic' | 'sources' | 'hotkeys'>('logic');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 select-none">
      <div className="bg-[#21252b] border-2 border-[#3a3f4b] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-xs text-[#abb2bf]">
        {/* Window Title Bar */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-[#181a1f] border-b border-[#3a3f4b]">
          <div className="flex items-center gap-1.5 font-bold text-[#d7dae0]">
            <HelpCircle className="w-3.5 h-3.5 text-[#e5c07b]" />
            <span>PoE Crafter: Decision Logic & Mod Rules</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-1.5 py-0.2 bg-[#282c34] hover:bg-[#e06c75] text-[#abb2bf] hover:text-white border border-[#3e4451] font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#1e2229] border-b border-[#3a3f4b] px-2 gap-1 pt-1">
          <button
            type="button"
            onClick={() => setActiveGuideTab('logic')}
            className={`px-3 py-1 text-xs font-semibold border-t border-l border-r ${
              activeGuideTab === 'logic'
                ? 'bg-[#21252b] border-[#3a3f4b] text-[#e5c07b] -mb-[1px]'
                : 'bg-[#181a1f] border-transparent text-[#5c6370] hover:text-[#abb2bf]'
            }`}
          >
            Alt/Aug Decision Logic
          </button>
          <button
            type="button"
            onClick={() => setActiveGuideTab('sources')}
            className={`px-3 py-1 text-xs font-semibold border-t border-l border-r ${
              activeGuideTab === 'sources'
                ? 'bg-[#21252b] border-[#3a3f4b] text-[#e5c07b] -mb-[1px]'
                : 'bg-[#181a1f] border-transparent text-[#5c6370] hover:text-[#abb2bf]'
            }`}
          >
            Mod Database (poedb.tw)
          </button>
          <button
            type="button"
            onClick={() => setActiveGuideTab('hotkeys')}
            className={`px-3 py-1 text-xs font-semibold border-t border-l border-r ${
              activeGuideTab === 'hotkeys'
                ? 'bg-[#21252b] border-[#3a3f4b] text-[#e5c07b] -mb-[1px]'
                : 'bg-[#181a1f] border-transparent text-[#5c6370] hover:text-[#abb2bf]'
            }`}
          >
            Hotkeys & Setup
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2 bg-[#21252b] text-xs">
          {activeGuideTab === 'logic' && (
            <div className="space-y-2">
              <div className="border border-[#3a3f4b] bg-[#181a1f] p-2.5 space-y-1.5">
                <div className="font-bold text-[#e5c07b]">
                  Core Magic Item Crafting Rules (1 Prefix, 1 Suffix)
                </div>
                <p className="text-[#abb2bf] leading-relaxed">
                  In Path of Exile, Magic (blue) items can hold a maximum of <strong>2 modifiers</strong>: exactly 1 Prefix and 1 Suffix.
                </p>
                <div className="font-mono text-[11px] bg-[#14161b] p-2 border border-[#2d3139] text-[#98c379] space-y-1">
                  <div>1. Alteration Orb rolls: 1 Prefix OR 1 Suffix OR 1 Prefix + 1 Suffix.</div>
                  <div>2. If 1 mod rolls and matches a target goal, an <strong>Orb of Augmentation</strong> is applied.</div>
                  <div>3. If both target goals are met, the craft terminates with success.</div>
                  <div>4. If an Augment fails or the item does not match, a new Alteration Orb is used.</div>
                </div>
              </div>

              <div className="border border-[#3a3f4b] bg-[#181a1f] p-2.5 space-y-1">
                <div className="font-bold text-[#61afef]">Target Evaluation Algorithm</div>
                <p className="text-[#abb2bf] leading-relaxed">
                  The engine matches copied clipboard text (`Ctrl+C` over the item) using strict regular expressions compiled for each modifier. When a tier threshold (e.g. T1 or T1-T2) is set, only values within that tier range trigger a stop.
                </p>
              </div>
            </div>
          )}

          {activeGuideTab === 'sources' && (
            <div className="space-y-2">
              <div className="border border-[#3a3f4b] bg-[#181a1f] p-2.5 space-y-1">
                <div className="font-bold text-[#e5c07b]">Official PoE Database Specification</div>
                <p className="text-[#abb2bf] leading-relaxed">
                  The modifier database contains hundreds of modifiers with accurate item level (iLvl) tier thresholds, generation weights, and influence tags:
                </p>
                <ul className="list-disc list-inside text-[11px] text-[#abb2bf] space-y-1 pl-1">
                  <li><strong>Normal Crafting Mods:</strong> Life, ES, Resistances, Attributes, Attack/Phys/Spell damage, Gem Levels (+1 All Spell Gems), Spell Suppression, Movement Speed.</li>
                  <li><strong>Influenced Mods:</strong> Hunter, Crusader, Redeemer, Warlord, Shaper, and Elder modifiers.</li>
                </ul>
              </div>
            </div>
          )}

          {activeGuideTab === 'hotkeys' && (
            <div className="border border-[#3a3f4b] bg-[#181a1f] p-2.5 space-y-2">
              <div className="font-bold text-[#e5c07b]">Hotkey Reference Table</div>
              <table className="w-full text-[11px] font-mono border-collapse">
                <tbody>
                  <tr className="border-b border-[#2d3139]">
                    <td className="py-1 px-2 text-[#98c379] font-bold w-20">F1</td>
                    <td className="py-1 px-2 text-[#abb2bf]">Start / Resume crafting loop</td>
                  </tr>
                  <tr className="border-b border-[#2d3139]">
                    <td className="py-1 px-2 text-[#e06c75] font-bold">F2</td>
                    <td className="py-1 px-2 text-[#abb2bf]">Emergency Stop crafting loop</td>
                  </tr>
                  <tr className="border-b border-[#2d3139]">
                    <td className="py-1 px-2 text-[#e5c07b] font-bold">F6</td>
                    <td className="py-1 px-2 text-[#abb2bf]">Calibrate Item screen position under mouse</td>
                  </tr>
                  <tr className="border-b border-[#2d3139]">
                    <td className="py-1 px-2 text-[#38bdf8] font-bold">F7</td>
                    <td className="py-1 px-2 text-[#abb2bf]">Calibrate Alteration Orb slot under mouse</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 text-[#c084fc] font-bold">F10</td>
                    <td className="py-1 px-2 text-[#abb2bf]">Calibrate Augmentation Orb slot under mouse</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-3 py-1.5 bg-[#181a1f] border-t border-[#3a3f4b]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-xs font-semibold text-[#abb2bf] hover:text-white"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
