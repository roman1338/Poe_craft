import React from 'react';
import { Settings, Package, Map } from 'lucide-react';
import { CrafterTab } from '../types';

interface CrafterSidebarProps {
  activeTab: CrafterTab;
  onSelectTab: (tab: CrafterTab) => void;
}

interface SidebarItem {
  id: CrafterTab;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

export const CrafterSidebar: React.FC<CrafterSidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const items: SidebarItem[] = [
    {
      id: 'general',
      label: 'General',
      icon: <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block shadow-sm" />,
      description: 'Settings & Checkboxes',
    },
    {
      id: 'craft',
      label: 'Craft',
      icon: <Package className="w-3.5 h-3.5 text-[#fbbf24]" />,
      description: 'Item, Mods & Positions',
    },
    {
      id: 'map_craft',
      label: 'Map craft',
      icon: <Map className="w-3.5 h-3.5 text-[#e06c75]" />,
      description: 'Future Map Crafting',
    },
  ];

  return (
    <aside className="w-44 shrink-0 bg-[#161a25] border-r border-[#273043] flex flex-col py-1.5 select-none">
      <div className="flex flex-col gap-1 px-1.5">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`sidebar-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-none border transition-all ${
                isActive
                  ? 'bg-[#1872b8] hover:bg-[#1f7ec8] border-[#3891d4] text-white shadow-md'
                  : 'bg-[#191f2c] hover:bg-[#202738] border-[#222a3a] text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              <span className="shrink-0 flex items-center justify-center">
                {item.icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="truncate leading-none">{item.label}</span>
                {item.description && (
                  <span className="text-[9px] text-[#64748b] truncate mt-0.5 font-normal">
                    {item.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
