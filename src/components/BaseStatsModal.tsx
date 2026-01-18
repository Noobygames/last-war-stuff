import type { GlobalBaseStats } from '../types';

interface BaseStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalStats: GlobalBaseStats;
  updateGlobalStat: (key: keyof GlobalBaseStats, value: string) => void;
}

export default function BaseStatsModal({ isOpen, onClose, globalStats, updateGlobalStat }: BaseStatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Base Stats</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
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
        </div>
      </div>
    </div>
  );
}