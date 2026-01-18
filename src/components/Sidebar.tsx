import type { GlobalBaseStats } from '../types';

interface SidebarProps {
  globalStats: GlobalBaseStats;
  updateGlobalStat: (key: keyof GlobalBaseStats, value: string) => void;
}

export default function Sidebar({ globalStats, updateGlobalStat }: SidebarProps) {
  return (
    <aside className="hidden xl:flex w-64 flex-shrink-0 bg-black/20 border-r border-gray-800 flex-col p-6 space-y-8 overflow-y-auto">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-blue-900/30 pb-1">Technologie</h3>
        
        {(['sf_tech_1', 'sf_tech_2'] as const).map((tech, i) => (
          <div key={tech} className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase">SF Tech {i + 1} (Level 0-10)</label>
            <input
              type="number"
              value={globalStats[tech]?.level || ''}
              onChange={(e) => updateGlobalStat(tech, e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors"
              placeholder="0"
              min="0"
              max="10"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-green-400 uppercase tracking-widest border-b border-green-900/30 pb-1">Drone</h3>
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase">Drone Level</label>
          <input
            type="number"
            value={globalStats.drone_lvl?.level || ''}
            onChange={(e) => updateGlobalStat('drone_lvl', e.target.value)}
            className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest border-b border-purple-900/30 pb-1">Sonstiges</h3>
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase">Andere Reduktion (%)</label>
          <input
            type="number"
            value={globalStats.other_red?.level || ''}
            onChange={(e) => updateGlobalStat('other_red', e.target.value)}
            className="w-full bg-black/40 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none transition-colors"
            placeholder="0"
          />
        </div>
      </div>
    </aside>
  );
}
