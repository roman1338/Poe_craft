import React, { useState } from 'react';
import { Crosshair, Check } from 'lucide-react';

interface OverlayHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlotName?: string;
  onPinSaved?: (slotName: string, coords: [number, number]) => void;
}

export const OverlayHelperModal: React.FC<OverlayHelperModalProps> = ({
  isOpen,
  onClose,
  targetSlotName = 'Item Slot',
  onPinSaved,
}) => {
  const [posX, setPosX] = useState(327);
  const [posY, setPosY] = useState(446);

  if (!isOpen) return null;

  const handleSavePin = () => {
    if (onPinSaved) {
      onPinSaved(targetSlotName, [posX, posY]);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 select-none">
      <div className="bg-[#21252b] border-2 border-[#3a3f4b] max-w-md w-full shadow-2xl text-xs text-[#abb2bf]">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-[#181a1f] border-b border-[#3a3f4b]">
          <div className="flex items-center gap-1.5 font-bold text-[#d7dae0]">
            <Crosshair className="w-3.5 h-3.5 text-[#e5c07b]" />
            <span>Calibrate Coordinates: {targetSlotName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-1.5 py-0.2 bg-[#282c34] hover:bg-[#e06c75] text-[#abb2bf] hover:text-white border border-[#3e4451] font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-3 space-y-2.5 bg-[#21252b]">
          <div className="border border-[#3a3f4b] bg-[#181a1f] p-2.5 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#5c6370] block mb-0.5">X Coordinate (px)</label>
                <input
                  type="number"
                  value={posX}
                  onChange={(e) => setPosX(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#14161b] border border-[#3a3f4b] px-2 py-1 text-xs font-mono text-[#d7dae0]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5c6370] block mb-0.5">Y Coordinate (px)</label>
                <input
                  type="number"
                  value={posY}
                  onChange={(e) => setPosY(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#14161b] border border-[#3a3f4b] px-2 py-1 text-xs font-mono text-[#d7dae0]"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#5c6370] leading-tight">
              Hover over the slot in Path of Exile and press the respective hotkey (F6 for Item, F7 for Alt, F10 for Aug) or type the pixel coordinates manually.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-1.5 px-3 py-1.5 bg-[#181a1f] border-t border-[#3a3f4b]">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-[#282c34] hover:bg-[#2f343f] border border-[#3e4451] text-xs text-[#abb2bf]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSavePin}
            className="px-3 py-1 bg-[#233827] hover:bg-[#2e4a34] border border-[#3e6847] text-xs font-bold text-[#98c379] flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Coordinates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
