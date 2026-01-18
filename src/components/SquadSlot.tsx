import React from 'react';
import type { SlotData, DRStats } from '../types';

interface SquadSlotProps {
  slotIdx: number;
  hero: SlotData;
  drStats: DRStats;
  onDrop: (heroId: string, slotIdx: number) => void;
  onRemove: (slotIdx: number) => void;
  onUpdateEx: (slotIdx: number, val: string) => void;
  onUpdateSkill: (slotIdx: number, type: 'tactics_lvl' | 'passive_lvl', val: string) => void;
  isMeta: boolean;
  onClick?: () => void;
}

export default function SquadSlot({ 
  slotIdx, 
  hero, 
  drStats, 
  onDrop, 
  onRemove, 
  onUpdateEx, 
  onUpdateSkill,
  isMeta,
  onClick
}: SquadSlotProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const heroId = e.dataTransfer.getData("heroId");
    if (heroId) onDrop(heroId, slotIdx);
  };

  const getDRColor = (val: number) => {
    if (val >= 85) return "text-red-500";
    if (val >= 70) return "text-yellow-400";
    return "text-blue-500";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`col-span-4 squad-slot aspect-[3/4] rounded-[1.5rem] border border-gray-700 bg-gray-900 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 shadow-xl ${hero.id ? 'occupied' : ''} ${isMeta ? 'meta-active' : ''}`}
    >
      {!hero.id ? (
        <div 
          onClick={onClick}
          className="absolute inset-0 z-0 flex flex-col items-center justify-center transition-opacity duration-300 cursor-pointer hover:bg-white/5"
        >
          <div className="text-5xl lg:text-6xl mb-2 opacity-20 grayscale group-hover:opacity-40 transition-opacity">🐢</div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-600 group-hover:text-blue-500 transition-colors mb-1">+</span>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-600 group-hover:text-blue-400 transition-colors">Click to Add</span>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full h-full flex flex-col">
          <div className="absolute inset-0 z-0">
            <img
              src={`img/${hero.id}.png`}
              onError={(e) => { (e.target as HTMLImageElement).src = 'img/new-turtle.png'; }}
              className="absolute -right-10 -top-10 w-[110%] h-[110%] object-cover opacity-40 mix-blend-luminosity hero-skew pointer-events-none"
              alt="splash"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/80 to-black"></div>
          </div>

          <div className="relative z-10 flex items-start gap-3 p-3 md:p-4 pb-0 h-[45%]">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain rounded-xl overflow-hidden border-2 border-gray-600 bg-gray-800 shadow-lg group-hover:border-blue-500/50 transition-colors">
              <img 
                src={`img/${hero.id}.png`} 
                onError={(e) => { (e.target as HTMLImageElement).src = 'img/placeholder.jpg'; }}
                className="w-full h-full object-cover" 
                alt={hero.name} 
              />
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0 px-1">
              <div className="flex justify-between items-center border-b border-white/5 pb-0.5 mb-0.5">
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Phys</span>
                <span className={`text-[10px] sm:text-sm md:text-[12px] lg:text-[16px] font-black italic leading-none ${getDRColor(drStats.phys)}`}>
                  {drStats.phys.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Ener</span>
                <span className={`text-[10px] sm:text-sm md:text-[12px] lg:text-[16px] font-black italic leading-none ${getDRColor(drStats.ener)}`}>
                  {drStats.ener.toFixed(1)}%
                </span>
              </div>
            </div>

            <button onClick={(e) => {
              e.stopPropagation();
              onRemove(slotIdx);
            }} className="absolute top-2 right-2 text-white/10 hover:text-red-500 transition-colors p-2 z-20 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="relative z-10 flex-1 flex flex-col px-2 sm:px-4 pb-2 sm:pb-4 gap-1.5 sm:gap-2 justify-end">
            <div className="text-[9px] sm:text-xs font-black text-center uppercase tracking-wider sm:tracking-[0.15em] text-white/90 bg-white/5 rounded py-0.5 sm:py-1 border border-white/5 truncate">
              {hero.name}
            </div>

            <div className="grid grid-cols-1 gap-1 sm:gap-1.5 bg-black/40 rounded-lg sm:rounded-xl p-1.5 sm:p-2 border border-white/5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1 h-2.5 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 w-5 sm:w-6 uppercase">EW</label>
                <input
                  type="number"
                  value={hero.ex_lvl || 0}
                  onChange={(e) => onUpdateEx(slotIdx, e.target.value)}
                  className="min-w-0 flex-1 bg-gray-900/80 border border-white/10 rounded px-1 sm:px-2 py-0.5 text-[10px] sm:text-xs text-right text-blue-300 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1 h-2.5 sm:h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 w-5 sm:w-6 uppercase">Pas</label>
                <input
                  type="number"
                  value={hero.skills?.passive || 1}
                  onChange={(e) => onUpdateSkill(slotIdx, 'passive_lvl', e.target.value)}
                  className="min-w-0 flex-1 bg-gray-900/80 border border-white/10 rounded px-1 sm:px-2 py-0.5 text-[10px] sm:text-xs text-right text-purple-300 focus:border-purple-500 outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1 h-2.5 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 w-5 sm:w-6 uppercase">Tac</label>
                <input
                  type="number"
                  value={hero.skills?.tactics || 1}
                  onChange={(e) => onUpdateSkill(slotIdx, 'tactics_lvl', e.target.value)}
                  className="min-w-0 flex-1 bg-gray-900/80 border border-white/10 rounded px-1 sm:px-2 py-0.5 text-[10px] sm:text-xs text-right text-yellow-300 focus:border-yellow-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
