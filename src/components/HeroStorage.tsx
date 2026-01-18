import React, { useState } from 'react';
import HERO_DATA_RAW from '../data/heroes.json';
import type { HeroBase } from '../types';

const HERO_DATA = HERO_DATA_RAW as HeroBase[];

interface HeroStorageProps {
  showNerzi: boolean;
}

export default function HeroStorage({ showNerzi }: HeroStorageProps) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredHeroes = HERO_DATA.filter(hero => {
    const matchesType = filter === "All" || hero.cat === filter;
    const matchesSearch = hero.name.toLowerCase().includes(search.toLowerCase());
    const isNerzi = hero.name === "Nerzi";
    if (isNerzi && !showNerzi) return false;
    return matchesType && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, heroId: string) => {
    e.dataTransfer.setData("heroId", heroId);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="hidden lg:flex lg:[@media(pointer:coarse)]:hidden w-64 xl:w-80 flex-shrink-0 bg-gray-900 border-l border-gray-800 flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="text-xs font-black text-white uppercase italic mb-4">Hero Storage</div>
        
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-black/40 border border-gray-700 rounded px-2 py-1 text-xs text-white mb-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-1">
          {['All', 'Tank', 'Aircraft', 'Missile'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-1 text-[9px] uppercase font-bold py-1 rounded border ${filter === cat ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-700 text-gray-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 no-scrollbar">
        {filteredHeroes.map(hero => (
          <div 
            key={hero.id}
            draggable
            onDragStart={(e) => handleDragStart(e, hero.id)}
            className="hero-storage-card group cursor-grab active:cursor-grabbing"
          >
            <div className="relative overflow-hidden rounded-lg border border-gray-800 bg-gray-950 p-2 hover:border-blue-500 transition-all">
              <div className="w-full h-16 flex items-center justify-center mb-1">
                <img 
                  src={`img/${hero.id}.png`} 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://emojicdn.elk.sh/🐢'; (e.target as HTMLImageElement).style.opacity = '0.5'; }}
                  className="max-w-full max-h-full object-contain rounded opacity-80 group-hover:opacity-100 transition-opacity"
                  alt={hero.name}
                />
              </div>
              <div className="text-[9px] font-black text-white uppercase truncate text-center">{hero.name}</div>
              <div className="text-[7px] text-gray-500 uppercase text-center">{hero.cat}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
