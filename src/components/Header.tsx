interface HeaderProps {
  currentSquadIdx: number;
  switchSquad: (idx: number) => void;
  onOpenSettings: () => void;
}

export default function Header({ currentSquadIdx, switchSquad, onOpenSettings }: HeaderProps) {
  return (
    <header className="h-16 flex-shrink-0 bg-gray-900/50 border-b border-gray-800 flex items-center px-6 justify-between z-50">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-black tracking-tighter uppercase italic">A5H <span className="text-blue-500">810</span></h1>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenSettings}
          className="xl:hidden p-2 text-gray-400 hover:text-white bg-black/40 rounded-lg border border-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <div className="flex bg-black/40 p-1 rounded-xl border border-gray-800 gap-1">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => switchSquad(idx)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-200 ease-in-out border ${
              currentSquadIdx === idx
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20 border-blue-500/50"
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border-transparent"
            }`}
          >
            Squad {idx + 1}
          </button>
        ))}
        </div>
      </div>
    </header>
  );
}
