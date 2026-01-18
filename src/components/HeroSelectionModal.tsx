import { useState } from 'react';
import HERO_DATA_RAW from '../data/heroes.json';
import type { HeroBase } from '../types';

const HERO_DATA = HERO_DATA_RAW as HeroBase[];

interface HeroSelectionModalProps {
  isOpen: boolean;
  onSelect: (heroId: string) => void;
  onClose: () => void;
}

export default function HeroSelectionModal({ isOpen, onSelect, onClose }: HeroSelectionModalProps) {
  const [filter, setFilter] = useState("All");
  
  if (!isOpen) return null;

  const filteredHeroes = HERO_DATA.filter(hero => {
    if (filter === "All") return true;
    return hero.cat === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Select Hero</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-2 flex gap-2 bg-gray-900 border-b border-gray-800">
           {['All', 'Tank', 'Aircraft', 'Missile'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors ${filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 content-start">
          {filteredHeroes.map(hero => (
            <button
              key={hero.id}
              onClick={() => onSelect(hero.id)}
              className="flex flex-col items-center gap-2 p-2 rounded-xl bg-gray-950 border border-gray-800 hover:border-blue-500 hover:bg-gray-900 transition-all group"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
                 <img 
                  src={`img/${hero.id}.png`} 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://emojicdn.elk.sh/🐢'; (e.target as HTMLImageElement).style.opacity = '0.5'; }}
                  className="w-full h-full object-contain rounded-lg group-hover:scale-110 transition-transform"
                  alt={hero.name}
                />
              </div>
              <div className="text-[10px] font-bold text-gray-300 uppercase truncate w-full text-center">{hero.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}